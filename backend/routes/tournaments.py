from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import (
    TournamentDB, TournamentCreate, TournamentUpdate, TournamentResponse,
    ClubDB, ClubCreate, ClubUpdate, ClubResponse,
    PlayerDB, PlayerCreate, PlayerUpdate, PlayerResponse,
    MatchDB, MatchCreate, MatchUpdate, MatchResponse,
    GroupStageDB, GroupStageCreate, GroupStageResponse,
    TournamentRegistrationDB, TournamentRegistrationCreate, TournamentRegistrationResponse,
    AttendanceDB
)
from routes.auth import get_current_user
from datetime import datetime
import uuid
import math

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

def generate_qr_code(data: str) -> str:
    return f"QR_{data}_{uuid.uuid4().hex[:8]}"

@router.get("/", response_model=list[TournamentResponse])
def get_tournaments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(TournamentDB).order_by(TournamentDB.created_at.desc()).all()

@router.post("/", response_model=TournamentResponse)
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_tournament = TournamentDB(
        **tournament.model_dump(),
        created_by=current_user.id,
        status="draft",
        created_at=datetime.utcnow()
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(TournamentDB).filter(TournamentDB.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.put("/{tournament_id}", response_model=TournamentResponse)
def update_tournament(tournament_id: int, tournament: TournamentUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_tournament = db.query(TournamentDB).filter(TournamentDB.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    for key, value in tournament.model_dump(exclude_none=True).items():
        setattr(db_tournament, key, value)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@router.delete("/{tournament_id}")
def delete_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_tournament = db.query(TournamentDB).filter(TournamentDB.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    db.query(MatchDB).filter(MatchDB.tournament_id == tournament_id).delete()
    db.query(GroupStageDB).filter(GroupStageDB.tournament_id == tournament_id).delete()
    db.query(TournamentRegistrationDB).filter(TournamentRegistrationDB.tournament_id == tournament_id).delete()
    db.delete(db_tournament)
    db.commit()
    return {"message": "Tournament deleted"}

@router.post("/{tournament_id}/generate-bracket")
def generate_bracket(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(TournamentDB).filter(TournamentDB.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    registrations = db.query(TournamentRegistrationDB).filter(
        TournamentRegistrationDB.tournament_id == tournament_id,
        TournamentRegistrationDB.status == "registered"
    ).all()
    
    if len(registrations) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 registered clubs")
    
    db.query(MatchDB).filter(MatchDB.tournament_id == tournament_id).delete()
    
    num_players = len(registrations)
    num_rounds = math.ceil(math.log2(num_players))
    
    match_number = 1
    for round_num in range(1, num_rounds + 1):
        matches_in_round = num_players // (2 ** round_num)
        for match_idx in range(matches_in_round):
            match = MatchDB(
                tournament_id=tournament_id,
                round=round_num,
                match_number=match_number,
                venue=tournament.venue,
                scheduled_time=tournament.start_date,
                status="scheduled"
            )
            db.add(match)
            match_number += 1
    
    tournament.status = "in_progress"
    db.commit()
    return {"message": f"Bracket generated with {num_rounds} rounds"}

# Clubs
@router.get("/clubs", response_model=list[ClubResponse])
def get_clubs(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(ClubDB).order_by(ClubDB.created_at.desc()).all()

@router.post("/clubs", response_model=ClubResponse)
def create_club(club: ClubCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_club = ClubDB(
        **club.model_dump(),
        qr_code=generate_qr_code(f"CLUB_{club.name}"),
        created_at=datetime.utcnow()
    )
    db.add(db_club)
    db.commit()
    db.refresh(db_club)
    return db_club

@router.get("/clubs/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    club = db.query(ClubDB).filter(ClubDB.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club

@router.put("/clubs/{club_id}", response_model=ClubResponse)
def update_club(club_id: int, club: ClubUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_club = db.query(ClubDB).filter(ClubDB.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    for key, value in club.model_dump(exclude_none=True).items():
        setattr(db_club, key, value)
    db.commit()
    db.refresh(db_club)
    return db_club

@router.delete("/clubs/{club_id}")
def delete_club(club_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    club = db.query(ClubDB).filter(ClubDB.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    db.query(PlayerDB).filter(PlayerDB.club_id == club_id).update({PlayerDB.club_id: None})
    db.delete(club)
    db.commit()
    return {"message": "Club deleted"}

# Players
@router.get("/players", response_model=list[PlayerResponse])
def get_players(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(PlayerDB).order_by(PlayerDB.points.desc()).all()

@router.post("/players", response_model=PlayerResponse)
def create_player(player: PlayerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_player = PlayerDB(
        **player.model_dump(),
        qr_code=generate_qr_code(f"PLAYER_{player.name}"),
        created_at=datetime.utcnow()
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.get("/players/{player_id}", response_model=PlayerResponse)
def get_player(player_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    player = db.query(PlayerDB).filter(PlayerDB.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.put("/players/{player_id}", response_model=PlayerResponse)
def update_player(player_id: int, player: PlayerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_player = db.query(PlayerDB).filter(PlayerDB.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    for key, value in player.model_dump(exclude_none=True).items():
        setattr(db_player, key, value)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    player = db.query(PlayerDB).filter(PlayerDB.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()
    return {"message": "Player deleted"}

@router.get("/players/rankings", response_model=list[PlayerResponse])
def get_player_rankings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(PlayerDB).order_by(PlayerDB.points.desc()).all()

# Matches
@router.get("/matches", response_model=list[MatchResponse])
def get_matches(tournament_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(MatchDB)
    if tournament_id:
        query = query.filter(MatchDB.tournament_id == tournament_id)
    return query.order_by(MatchDB.round, MatchDB.match_number).all()

@router.post("/matches", response_model=MatchResponse)
def create_match(match: MatchCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_match = MatchDB(
        **match.model_dump(),
        created_at=datetime.utcnow()
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/matches/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(MatchDB).filter(MatchDB.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@router.put("/matches/{match_id}", response_model=MatchResponse)
def update_match(match_id: int, match: MatchUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_match = db.query(MatchDB).filter(MatchDB.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    for key, value in match.model_dump(exclude_none=True).items():
        setattr(db_match, key, value)
    
    if match.winner_id:
        winner = db.query(PlayerDB).filter(PlayerDB.id == match.winner_id).first()
        if winner:
            winner.wins += 1
            winner.points += 3
        loser_id = db_match.player1_id if db_match.player2_id == match.winner_id else db_match.player2_id
        if loser_id:
            loser = db.query(PlayerDB).filter(PlayerDB.id == loser_id).first()
            if loser:
                loser.losses += 1
        
        next_round = db_match.round + 1
        next_match_num = (db_match.match_number + 1) // 2
        next_match = db.query(MatchDB).filter(
            MatchDB.tournament_id == db_match.tournament_id,
            MatchDB.round == next_round,
            MatchDB.match_number == next_match_num
        ).first()
        if next_match:
            if db_match.match_number % 2 == 1:
                next_match.player1_id = match.winner_id
            else:
                next_match.player2_id = match.winner_id
    
    db.commit()
    db.refresh(db_match)
    return db_match

@router.post("/matches/{match_id}/start")
def start_match(match_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(MatchDB).filter(MatchDB.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.status = "in_progress"
    match.start_time = datetime.utcnow()
    db.commit()
    return {"message": "Match started"}

@router.post("/matches/{match_id}/complete")
def complete_match(match_id: int, score1: int, score2: int, winner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(MatchDB).filter(MatchDB.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.score1 = score1
    match.score2 = score2
    match.winner_id = winner_id
    match.status = "completed"
    
    winner = db.query(PlayerDB).filter(PlayerDB.id == winner_id).first()
    if winner:
        winner.wins += 1
        winner.points += 3
    
    loser_id = match.player1_id if match.player2_id == winner_id else match.player2_id
    if loser_id:
        loser = db.query(PlayerDB).filter(PlayerDB.id == loser_id).first()
        if loser:
            loser.losses += 1
    
    next_round = match.round + 1
    next_match_num = (match.match_number + 1) // 2
    next_match = db.query(MatchDB).filter(
        MatchDB.tournament_id == match.tournament_id,
        MatchDB.round == next_round,
        MatchDB.match_number == next_match_num
    ).first()
    if next_match:
        if match.match_number % 2 == 1:
            next_match.player1_id = winner_id
        else:
            next_match.player2_id = winner_id
    
    db.commit()
    return {"message": "Match completed"}

# Tournament Registrations
@router.get("/registrations", response_model=list[TournamentRegistrationResponse])
def get_registrations(tournament_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(TournamentRegistrationDB)
    if tournament_id:
        query = query.filter(TournamentRegistrationDB.tournament_id == tournament_id)
    return query.all()

@router.post("/registrations", response_model=TournamentRegistrationResponse)
def register_club(registration: TournamentRegistrationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(TournamentRegistrationDB).filter(
        TournamentRegistrationDB.tournament_id == registration.tournament_id,
        TournamentRegistrationDB.club_id == registration.club_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Club already registered")
    
    db_registration = TournamentRegistrationDB(
        **registration.model_dump(),
        status="registered",
        registered_at=datetime.utcnow()
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration

# Group Stage
@router.get("/groups", response_model=list[GroupStageResponse])
def get_groups(tournament_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(GroupStageDB)
    if tournament_id:
        query = query.filter(GroupStageDB.tournament_id == tournament_id)
    return query.order_by(GroupStageDB.group_name, GroupStageDB.points.desc()).all()

@router.post("/groups", response_model=GroupStageResponse)
def add_to_group(group: GroupStageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_group = GroupStageDB(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

# QR Code Check-in
@router.post("/check-in")
def check_in(qr_code: str, club_id: int = None, player_id: int = None, match_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if match_id:
        attendance = AttendanceDB(
            match_id=match_id,
            club_id=club_id,
            player_id=player_id,
            checked_in=True
        )
        db.add(attendance)
        db.commit()
        return {"message": "Check-in successful"}
    
    if player_id:
        player = db.query(PlayerDB).filter(PlayerDB.id == player_id, PlayerDB.qr_code == qr_code).first()
        if not player:
            raise HTTPException(status_code=404, detail="Invalid player QR code")
        return {"player": {"id": player.id, "name": player.name, "level": player.level, "club_id": player.club_id}}
    
    if club_id:
        club = db.query(ClubDB).filter(ClubDB.id == club_id, ClubDB.qr_code == qr_code).first()
        if not club:
            raise HTTPException(status_code=404, detail="Invalid club QR code")
        return {"club": {"id": club.id, "name": club.name, "city": club.city}}
    
    raise HTTPException(status_code=400, detail="Invalid check-in request")

# Dashboard Stats
@router.get("/stats")
def get_tournament_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_tournaments = db.query(TournamentDB).count()
    active_tournaments = db.query(TournamentDB).filter(TournamentDB.status == "in_progress").count()
    completed_tournaments = db.query(TournamentDB).filter(TournamentDB.status == "completed").count()
    total_clubs = db.query(ClubDB).count()
    total_players = db.query(PlayerDB).count()
    
    return {
        "totalTournaments": total_tournaments,
        "activeTournaments": active_tournaments,
        "completedTournaments": completed_tournaments,
        "totalClubs": total_clubs,
        "totalPlayers": total_players
    }