const RentalService = require('../services/RentalService');

class RentalController {
  async createRental(req, res) {
    try {
      const rentalData = { ...req.body, company: req.user._id };
      const rental = await RentalService.createRental(rentalData);
      res.status(201).json(rental);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error creating rental', error: error.message });
    }
  }

  async getRental(req, res) {
    try {
      const rental = await RentalService.getRentalById(req.params.rentalId);
      res.status(200).json(rental);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching rental', error: error.message });
    }
  }

  async updateRental(req, res) {
    try {
      const rental = await RentalService.updateRental(
        req.params.rentalId,
        req.body
      );
      res.status(200).json(rental);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating rental', error: error.message });
    }
  }

  async deleteRental(req, res) {
    try {
      await RentalService.deleteRental(req.params.rentalId);
      res.status(204).end();
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error deleting rental', error: error.message });
    }
  }

  async listRentals(req, res) {
    try {
      const rentals = await RentalService.listRentals();
      res.status(200).json(rentals);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error listing rentals', error: error.message });
    }
  }

  async checkRentalExpiry(req, res) {
    try {
      await RentalService.checkRentalExpiry();
      res.status(200).json({ message: 'Rental expiry check completed' });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error checking rental expiry',
          error: error.message,
        });
    }
  }
}

module.exports = new RentalController();
