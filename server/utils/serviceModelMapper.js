import DoctorService from "../models/DoctorService.js";
import ClinicService from "../models/ClinicService.js";
import LaboratoryTest from "../models/LaboratoryTest.js";
import Medicine from "../models/Medicine.js";

const serviceModelMap = {
  doctor: DoctorService,
  clinic: ClinicService,
  laboratory: LaboratoryTest,
  pharmacy: Medicine,
};

export const getModelForServiceType = (serviceType) => {
  return serviceModelMap[serviceType.toLowerCase()];
};
