import api from "./api";

const RoomService = {
  getRooms(params = {}) {
    return api.get("/rooms", { params });
  },
  getRoomDetail(id) {
    return api.get(`/rooms/${id}`);
  },
  getRoomBeds(roomId) {
    return api.get(`/rooms/${roomId}/beds`);
  },
};

export default RoomService;
