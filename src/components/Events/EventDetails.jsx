import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  const {
    data,
    isPending: queryPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDeleteEvent = () => {
    mutate({ id });
  };

  let content;

  if (queryPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load selected event."
          message={
            error.info?.message ||
            "Failed to fetch event, please try again later."
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>

        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.image} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action can not be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="button"
                  disabled={isPendingDeletion}
                >
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete selected event."
              message={
                deleteError.info?.message ||
                "Failed to delete event, please try again later."
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      (<article id="event-details">{content}</article>)
    </>
  );
}
