import axios from "axios";

const res = await axios.get(API_URL);

const API_URL = `${API_URL}/api/factures`;

export const getFactures = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getFacturesParEcole = async (ecoleId) => {
  const res = await axios.get(`${API_URL}/api/ecole/${ecoleId}`);
  return res.data;
};
