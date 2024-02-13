const myAccessToken =
  "YzVkODhhMjctNzRlMS00NGFhLTg1ZGQtMTRhMjNiYzQ1YzliOTUyMzI4OTctMTcy_P0A1_7e57d048-2511-4d53-8dd4-05fe61659f5d";

// This is one way you might programattically determine your redirect_uri
// depending on where you've deployed your app, but you're probably better off
// having development/staging/production builds and injecting directly from the
// environment.
let redirect_uri = `${window.location.protocol}//${window.location.host}`;

if (window.location.pathname) {
  redirect_uri += window.location.pathname;
}

const webex = window.Webex.init({
  credentials: {
    redirect_uri,
    access_token: myAccessToken,
    scope: "spark:all spark:kms",
  },
});

webex.meetings.register().catch((err) => {
  console.error(err);
  alert(err);
  throw err;
});

function bindMeetingEvents(meeting) {
  meeting.on("error", (err) => {
    console.error(err);
  });

  // Handle media streams changes to ready state
  meeting.on("media:ready", (media) => {
    if (!media) {
      return;
    }
    if (media.type === "local") {
      document.getElementById("self-view").srcObject = media.stream;
    }
    if (media.type === "remoteVideo") {
      document.getElementById("remote-view-video").srcObject = media.stream;
    }
    if (media.type === "remoteAudio") {
      document.getElementById("remote-view-audio").srcObject = media.stream;
    }
  });

  // Handle media streams stopping
  meeting.on("media:stopped", (media) => {
    // Remove media streams
    if (media.type === "local") {
      document.getElementById("self-view").srcObject = null;
    }
    if (media.type === "remoteVideo") {
      document.getElementById("remote-view-video").srcObject = null;
    }
    if (media.type === "remoteAudio") {
      document.getElementById("remote-view-audio").srcObject = null;
    }
  });

  // Of course, we'd also like to be able to leave the meeting:
  document.getElementById("hangup").addEventListener("click", () => {
    meeting.leave();
  });
}

// Join the meeting and add media
function joinMeeting(meeting) {
  return meeting.join().then(() => {
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: false,
      sendVideo: true,
      sendAudio: true,
      sendShare: false,
    };

    // Get our local media stream and add it to the meeting
    return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
      const [localStream, localShare] = mediaStreams;

      meeting.addMedia({
        localShare,
        localStream,
        mediaSettings,
      });
    });
  });
}

document.getElementById("destination").addEventListener("submit", (event) => {
  // again, we don't want to reload when we try to join
  event.preventDefault();

  const destination = document.getElementById("invitee").value;

  return webex.meetings
    .create(destination)
    .then((meeting) => {
      // Call our helper function for binding events to meetings
      bindMeetingEvents(meeting);

      return joinMeeting(meeting);
    })
    .catch((error) => {
      // Report the error
      console.error(error);
    });
});
