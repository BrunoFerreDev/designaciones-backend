import api from "../api.js";

const exportJson = () =>
  api.get("/backup/export/json", { responseType: "blob" }).then((r) => r.data);

const exportSql = () =>
  api.get("/backup/export/sql", { responseType: "blob" }).then((r) => r.data);

const importJson = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/backup/import/json", formData)
    .then((r) => r.data);
};

export default {
  exportJson,
  exportSql,
  importJson,
};
