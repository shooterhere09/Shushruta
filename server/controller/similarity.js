const productModel = require("../models/products");
const userModel = require("../models/users");
const { calculateSimilarity } = require("../utils/nlp");
const geolib = require('geolib');

class Similarity {
  constructor(userModel, productModel) {
    this.userModel = userModel;
    this.productModel = productModel;
  }
  async getRankedOrganReports(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const patient = await this.userModel.findById(userId);

      if (!patient || patient.userType !== "patient") {
        return res.status(404).json({ error: "Patient not found or is not a patient user." });
      }

      if (!patient.medicalReportContent) {
        return res.status(400).json({ error: "Patient has no medical report uploaded." });
      }

      const patientReport = patient.medicalReportContent;

      let patientLat, patientLon;
      if (patient.userType === "hospital" && patient.hospitalInfo) {
        patientLat = patient.hospitalInfo.latitude;
        patientLon = patient.hospitalInfo.longitude;
      } else if (patient.userType === "patient" && patient.address) {
        patientLat = patient.address.latitude;
        patientLon = patient.address.longitude;
      }

      if (patientLat === undefined || patientLon === undefined) {
        return res.status(400).json({ error: "Patient location not available for distance calculation." });
      }

      const organProducts = await this.productModel.find({});

      const rankedOrgans = [];

      for (const organ of organProducts) {
        if (organ.pMedicalReport && organ.latitude !== undefined && organ.longitude !== undefined) {
          const similarity = calculateSimilarity(patientReport, organ.pMedicalReport);
          
          const distance = geolib.getDistance(
            { latitude: patientLat, longitude: patientLon },
            { latitude: organ.latitude, longitude: organ.longitude }
          ); // Distance in meters

          // Normalize similarity (0 to 1) and distance (inverse, so smaller distance is higher score)
          // Max distance on Earth is ~20,000,000 meters (half circumference)
          const maxPossibleDistance = 20000000; 
          const normalizedDistanceScore = 1 - Math.min(distance / maxPossibleDistance, 1); // 1 for 0 distance, 0 for max distance

          // Combine scores (e.g., 70% medical similarity, 30% distance proximity)
          const combinedScore = (similarity * 0.7) + (normalizedDistanceScore * 0.3);

          rankedOrgans.push({
            organ: organ,
            similarity: similarity,
            distance: distance, // in meters
            combinedScore: combinedScore,
          });
        }
      }

      rankedOrgans.sort((a, b) => b.combinedScore - a.combinedScore);

      return res.status(200).json({ rankedOrgans });
    } catch (error) {
      console.error("Error ranking organ reports:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

module.exports = new Similarity(userModel, productModel);