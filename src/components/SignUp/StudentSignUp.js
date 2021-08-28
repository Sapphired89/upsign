import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "@firebase/firestore"

import SessionSelector from './SessionSelector'
import { getHourSessions } from "../../utils";

const StudentSignUp = (props) => {
  const db = props.db;
  const user = props.user;

  const [sessions, setSessions] = useState([])

  const initialLoadSessions = async () => {
    let s = []
    for ( var i = 0; i < 7; i++ ) {
      s[i] = await getHourSessions(db, i+1)
    }
    setSessions(s)
  }

  // Initial load
  useEffect(() => {
    initialLoadSessions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize the update listeners
  useEffect(() => {
    for ( var j = 0; j < 7; j++ ) {
      const index = j
      const hour = j + 1

      const q = query(collection(db, "sessions"), where("session", "==", hour));
      onSnapshot(q, (querySnapshot) => {
        
        let hourSessions = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().title) {
            hourSessions.push({
              id: doc.id,
              ...doc.data()
            })
          }
        })
        let tempSessions = sessions
        tempSessions[index] = hourSessions
        setSessions([...tempSessions])
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])


  if (sessions.length === 0) {
    return (
      <div className="progress">
        <div className="indeterminate"></div>
      </div>
    )
  }

  if (Array.isArray(sessions)) {
    return (
      <div>
        <h3>
          <div>Hey there, <b>{user.displayName.split(' ')[0]}</b></div>
        </h3>
        <blockquote className="top-message">
          <p>Please sign up for the sessions you want below.</p>
          <p>Just click on what you want. Your choices are automatically saved 😊</p>
        </blockquote>
        <hr style={{margin: "1rem 0 3rem 0"}} />

        { sessions.map( (session, index) => <SessionSelector key={`session-${index}`} hourSessions={session} hour={index+1} user={user} db={db} /> ) }
      </div>
    )
  }

  return (
    <div>
      Uh oh! An error occured while trying to load your sessions.
    </div>
  )

}

export default StudentSignUp