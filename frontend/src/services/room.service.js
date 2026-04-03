import api from "./api";

const RoomService = {
  getRooms(params = {}) {
    return api.get("/rooms", { params });
  },
  getRoomDetail(id) {
    return api.get(`/rooms/${id}`);
  },
};

export default RoomService;
