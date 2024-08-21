const Rental = require('../models/Rental');

class RentalService {
  async createRental(rentalData) {
    const rental = new Rental(rentalData);
    return await rental.save();
  }

  async getRentalById(rentalId) {
    return await Rental.findById(rentalId).populate('company').exec();
  }

  async updateRental(rentalId, updateData) {
    return await Rental.findByIdAndUpdate(rentalId, updateData, {
      new: true,
    }).exec();
  }

  async deleteRental(rentalId) {
    return await Rental.findByIdAndDelete(rentalId).exec();
  }

  async listRentals() {
    return await Rental.find().populate('company').exec();
  }

  async listItemsByCompany(companyId) {
    return await Rental.findOne({ company: companyId })
      .populate('items')
      .exec();
  }

  async checkRentalExpiry() {
    // 렌탈 종료일이 지난 아이템들에 대한 처리
    const expiredItems = await Rental.find({
      'items.returnDate': { $lt: new Date() },
    }).exec();
    expiredItems.forEach((rental) => {
      rental.items.forEach((item) => {
        if (item.returnDate && new Date(item.returnDate) < new Date()) {
          item.stock += 1; // 재고 복원
          item.returnDate = null; // 반납 처리
        }
      });
      rental.save();
    });
  }
}

module.exports = new RentalService();
