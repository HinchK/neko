package room

import (
	"net/http"

	"github.com/go-chi/chi"

	"demodesk/neko/internal/http/auth"
	"demodesk/neko/internal/utils"
)

type ControlStatusPayload struct {
	HasHost bool   `json:"has_host"`
	HostId  string `json:"host_id,omitempty"`
}

type ControlTargetPayload struct {
	ID string `json:"id"`
}

func (h *RoomHandler) controlStatus(w http.ResponseWriter, r *http.Request) error {
	host := h.sessions.GetHost()

	if host != nil {
		return utils.HttpSuccess(w, ControlStatusPayload{
			HasHost: true,
			HostId:  host.ID(),
		})
	}

	return utils.HttpSuccess(w, ControlStatusPayload{
		HasHost: false,
	})
}

func (h *RoomHandler) controlRequest(w http.ResponseWriter, r *http.Request) error {
	host := h.sessions.GetHost()
	if host != nil {
		return utils.HttpUnprocessableEntity("there is already a host")
	}

	session, _ := auth.GetSession(r)
	h.sessions.SetHost(session)

	return utils.HttpSuccess(w)
}

func (h *RoomHandler) controlRelease(w http.ResponseWriter, r *http.Request) error {
	session, _ := auth.GetSession(r)
	if !session.IsHost() {
		return utils.HttpUnprocessableEntity("session is not the host")
	}

	h.desktop.ResetKeys()
	h.sessions.ClearHost()

	return utils.HttpSuccess(w)
}

func (h *RoomHandler) controlTake(w http.ResponseWriter, r *http.Request) error {
	session, _ := auth.GetSession(r)
	h.sessions.SetHost(session)

	return utils.HttpSuccess(w)
}

func (h *RoomHandler) controlGive(w http.ResponseWriter, r *http.Request) error {
	sessionId := chi.URLParam(r, "sessionId")

	target, ok := h.sessions.Get(sessionId)
	if !ok {
		return utils.HttpNotFound("target session was not found")
	}

	if !target.Profile().CanHost {
		return utils.HttpBadRequest("target session is not allowed to host")
	}

	h.sessions.SetHost(target)

	return utils.HttpSuccess(w)
}

func (h *RoomHandler) controlReset(w http.ResponseWriter, r *http.Request) error {
	host := h.sessions.GetHost()

	if host != nil {
		h.desktop.ResetKeys()
		h.sessions.ClearHost()
	}

	return utils.HttpSuccess(w)
}
