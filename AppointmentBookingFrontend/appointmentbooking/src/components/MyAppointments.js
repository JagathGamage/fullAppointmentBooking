import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Button, Stack, CircularProgress, Grid } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import bgImage from "../assets/bg.jpg"; 

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!userEmail || !token) {
      console.error("User email or token missing");
      setLoading(false);
      return;
    }

    axios
      .get(`${backendUrl}/api/appointments/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        setAppointments(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error.response?.data || error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userEmail, token]);

  const formatDateTime = (dateArray, startTimeArray, endTimeArray) => {
    if (!Array.isArray(dateArray) || !Array.isArray(startTimeArray) || !Array.isArray(endTimeArray)) {
      return { formattedDate: "Invalid Date", formattedStartTime: "Invalid Time", formattedEndTime: "Invalid Time" };
    }

    const [year, month, day] = dateArray;
    const [startHour, startMinute] = startTimeArray;
    const [endHour, endMinute] = endTimeArray;

    const appointmentDate = new Date(year, month - 1, day);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(appointmentDate);

    const formatTime = (hour, minute) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(0, 0, 0, hour, minute));

    return {
      formattedDate,
      formattedStartTime: formatTime(startHour, startMinute),
      formattedEndTime: formatTime(endHour, endMinute),
    };
  };

  const cancelAppointment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmDelete) return;
    try {
      await axios.post(
        `${backendUrl}/api/appointments/cancel/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      alert("Appointment cancelled");
    } catch (error) {
      console.error("Error cancelling appointment:", error.response?.data || error);
    }
  };

  return (
    <Box sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      zIndex: -1,
    }}>
      <Box sx={{ maxWidth: "90%", mx: "auto", p: 3 }}>
        <Typography variant="h4" sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}>
          My Appointments
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress size={50} />
          </Box>
        ) : appointments.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", color: "gray" }}>
            No appointments found.
          </Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {appointments.map((appt) => {
              const { formattedDate, formattedStartTime, formattedEndTime } = formatDateTime(appt.date, appt.startTime, appt.endTime);

              return (
                <Grid item xs={12} sm={6} md={4} key={appt.id}>
                  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#9575cd" }}>
                        {formattedDate}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontSize: "1.1rem",
                          color: "#555",
                        }}
                      >
                        <AccessTimeIcon fontSize="small" /> {formattedStartTime} - {formattedEndTime}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: "#3A0066" }}
                        onClick={() => cancelAppointment(appt.id)}
                      >
                        Cancel Appointment
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MyAppointments;
