import api from "./api";

const BedService = {
    updateBedStatusToRented(ma_giuong) {   
        return api.put(`/beds/${ma_giuong}/rent`);
    }
};

export default BedService;
