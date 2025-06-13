import { useEffect, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function ModalAgregarEquipo({ plantaId, visible, onClose, onSuccess }) {
  const [racks, setRacks] = useState([]);
  const [rackId, setRackId] = useState("");
  const [nombre, setNombre] = useState("");
  const [ip, setIp] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [funcion, setFuncion] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: "px", width: 100, height: 100 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  useEffect(() => {
    if (plantaId) {
      fetch(`http://localhost/mapeo-plantas/backend/api/get_racks_by_planta.php?planta_id=${plantaId}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setRacks(json.data);
          } else {
            console.error("Respuesta inválida del backend:", json);
            setRacks([]); // fallback seguro
          }
        })
        .catch(err => {
          console.error("Error al cargar racks:", err);
          setRacks([]);
        });
    }
  }, [plantaId]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!rackId || !nombre.trim()) {
      alert("Debes seleccionar un rack y nombre.");
      return;
    }

    const area_x = Math.round(completedCrop?.x ?? 0);
    const area_y = Math.round(completedCrop?.y ?? 0);
    const area_width = Math.round(completedCrop?.width ?? 0);
    const area_height = Math.round(completedCrop?.height ?? 0);

    fetch("http://localhost/mapeo-plantas/backend/api/create_equipo.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rack_id: rackId,
        nombre,
        ip,
        marca,
        modelo,
        funcion,
        etiquetas,
        foto: imageSrc,
        x: area_x,
        y: area_y,
        width: area_width,
        height: area_height
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onSuccess();
          onClose();
        } else {
          alert("Error al guardar el dispositivo.");
        }
      })
      .catch(err => {
        console.error("Error en create_equipo.php:", err);
        alert("Ocurrió un error al guardar.");
      });
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", padding: "20px", borderRadius: "8px",
        width: "600px", maxHeight: "90vh", overflowY: "auto"
      }}>
        <h3>Añadir Dispositivo</h3>

        <label>Rack destino:</label>
        <select value={rackId} onChange={e => setRackId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Selecciona un rack --</option>
          {Array.isArray(racks) && racks.map(r => (
            <option key={r.id} value={r.id}>Rack {r.numero || r.id}</option>
          ))}
        </select>

        <label>Nombre:</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: "100%" }} />

        <label>IP:</label>
        <input value={ip} onChange={e => setIp(e.target.value)} style={{ width: "100%" }} />

        <label>Marca:</label>
        <input value={marca} onChange={e => setMarca(e.target.value)} style={{ width: "100%" }} />

        <label>Modelo:</label>
        <input value={modelo} onChange={e => setModelo(e.target.value)} style={{ width: "100%" }} />

        <label>Función:</label>
        <textarea value={funcion} onChange={e => setFuncion(e.target.value)} style={{ width: "100%" }} />

        <label>Etiquetas:</label>
        <textarea value={etiquetas} onChange={e => setEtiquetas(e.target.value)} style={{ width: "100%" }} />

        <label>Foto del dispositivo:</label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {imageSrc && (
          <div style={{ marginTop: "10px" }}>
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img
                ref={(ref) => setImgRef(ref)}
                src={imageSrc}
                alt="selección"
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
        )}

        <div style={{ marginTop: "10px", textAlign: "right" }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default ModalAgregarEquipo;
