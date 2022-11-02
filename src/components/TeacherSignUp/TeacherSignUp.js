import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc } from "@firebase/firestore"

import {
  getSessionTimes,
  getNumberSessions,
  getTeacherSessions,
  getDefaultDay,
} from "../../services";
import {
  observeTopIntersect,
  getSchoolId,
} from "../../utils";

import SessionEditor from "./SessionEditor";
import { DatePicker, LoadingBar, SettingsButton } from "../";

const TopMessage = ({ user }) => {
  
  return (
    <div>
      <h3 style={{marginTop: "3rem", userSelect: "none"}}>
        <div>Hey there, {user
            ? user.nickname
              ? <b>{user.nickname.split(' ')[0]}</b>
              : <b>{user.displayName.split(' ')[0]}</b>
            : ''}
        </div>
      </h3>
      <blockquote className="top-message">
        <p>Please fill in whatever sessions you want to hold.</p>
        <p>You can select any day of the year now!</p>
        <p>Sessions without titles will not show up as options for students.</p>
      </blockquote>
      <hr style={{margin: "1rem 0 1rem 0"}} />
    </div>
  )
}

const TeacherSignUp = ({ db, user }) => {

  const [sessions, setSessions] = useState()
  // This is just needed to getTeacherSessions again if the number updates
  // getTeacherSessions also creates sessions for the teacher
  const [numberSessions, setNumberSessions] = useState(1)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sessionTimes, setSessionTimes] = useState([])

  const schoolId = getSchoolId()

  const updateSessionTimes = async (db) => {
    const newTimes = await getSessionTimes(db, selectedDate)
    setSessionTimes(newTimes)
  }

  const updateNumberSessions = async (db) => {
    const newNumber = await getNumberSessions(db, selectedDate)
    setNumberSessions(newNumber)
  }

  // Initialize the observer
  // Checks when the DatePicker (".sticky-container") intersects with the navbar
  useEffect(() => {
    observeTopIntersect()
  }, [sessions])

  // Subscribe to updates for session number and times
  useEffect(() => {
    // Set up snapshot & load the times of the sessions
    const d = doc(db, "schools", schoolId, "config", "sessions")
    const unsubscribe = onSnapshot(d, () => {
      updateSessionTimes(db)
      updateNumberSessions(db)
    })

    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, selectedDate])


  const handleLoadSessions = async () => {
    setSessions(null)
    await getTeacherSessions(db, selectedDate, user)
      .then(s => {
        setSessions(s)
      })
  }

  const handleSelectDate = (date) => {
    setSessions(null)
    setSelectedDate(date)
  }

  // Select default day
  const updateDefaultDay = async (db) => {
    const defaultDay = await getDefaultDay(db)
    setSelectedDate(defaultDay)
  }

  useEffect(() => {
    updateDefaultDay(db)

    // Load teacher sessions
    handleLoadSessions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const q = query(collection(
                db,
                "schools",
                schoolId,
                "sessions",
                String(selectedDate.getFullYear()),
                String(selectedDate.toDateString())),
                where("teacher", "==", user.displayName));
    const unsubscribe = onSnapshot(q, async () => {
      await getTeacherSessions(db, selectedDate, user)
        .then( s => {
          setSessions(s)
        }
      )
    })

    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, selectedDate, numberSessions])



  if (!sessions) {
    return (
      <div>
        <TopMessage user={user} />
        
        <LoadingBar />
      </div>
    )
  }

  return (
    <div>
      <TopMessage user={user} />
      <div className="sticky-container">
        <div className="sticky-content">
          <DatePicker selectedDate={selectedDate} handleSelectDate={handleSelectDate} />
        </div>
      </div>

      <div className="teacher-sessions">
        { Array.isArray(sessions)
          ? sessions.map( s =>
            <div key={s.id} className="session-section">
              <h4 className="session-header">Session {s.session} 
                <span className="session-time"> {sessionTimes[s.session - 1] ? '('+sessionTimes[s.session - 1]+')': ''}</span>
              </h4>
              <hr style={{marginBottom: "1rem"}} />
              <div className="row card session-card is-enrolled teacher-card">
                <SessionEditor key={s.id} session={s} db={db} date={selectedDate} />
              </div>
            </div>
            )
          : null }
        <SettingsButton />
      </div>
    </div>
  )
}

export default TeacherSignUp