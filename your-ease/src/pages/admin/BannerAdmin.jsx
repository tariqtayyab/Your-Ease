import React, { useState, useEffect } from "react";
import axios from "axios";

const BannerAdmin = () => {
  const [imageFile, setImageFile] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Use consistent token source
  const getAdminToken = () => {
    const adminInfo = localStorage.getItem("token")
    return adminInfo
  };

  const fetchBanners = async () => {
    try {
      const token = getAdminToken();
      const res = await axios.get("http://localhost:5000/api/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(res.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };


  const handleAddBanner = async (e) => {
  e.preventDefault();
  if (!imageFile) return alert("Please select an image");

  const formData = new FormData();
  formData.append("image", imageFile); 

  try {
    setLoading(true);
    const token = getAdminToken();
    
    console.log("🔄 Sending request to server...");
    const response = await axios.post("http://localhost:5000/api/banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("✅ Server response:", response.data);
    setImageFile(null);
    await fetchBanners();
    alert("✅ Banner added successfully!");
    
  } catch (error) {
    console.error("❌ Full error object:", error);
    console.error("❌ Error response:", error.response);
    console.error("❌ Error message:", error.message);
    
    if (error.response) {
      // Server responded with error status
      alert(`Upload failed: ${error.response.data.message || error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      alert("Upload failed: No response from server. Check server logs.");
    } else {
      // Something else happened
      alert(`Upload failed: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const token = getAdminToken();
      await axios.delete(`http://localhost:5000/api/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div style={styles.mainContainer}>
      <div style={styles.innerContainer}>
        <h2 style={styles.heading}>🖼️ Manage Banners</h2>

        <form onSubmit={handleAddBanner} style={styles.form}>
          <label htmlFor="fileUpload" style={styles.uploadLabel}>
            {imageFile ? imageFile.name : "Choose Banner Image"}
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          <button type="submit" style={styles.addBtn} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <div style={styles.bannerGrid}>
          {banners.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center" }}>No banners uploaded yet.</p>
          ) : (
            banners.map((banner) => (
              <div key={banner._id} style={styles.card}>
                <img
                  src={banner.image.startsWith("http") ? banner.image : `http://localhost:5000${banner.image}`}
                  alt="banner"
                  style={styles.image}
                />
                <button
                  onClick={() => handleDelete(banner._id)}
                  style={styles.deleteBtn}
                >
                  ❌ Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  mainContainer: {
    flex: 1,
    width: "100%",
    minHeight: "100vh",
    background: "#f5f6fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "30px 0",
    overflowY: "auto",
  },
  innerContainer: {
    width: "90%",
    maxWidth: "1000px",
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  heading: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "20px",
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
  },
  form: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "30px",
  },
  uploadLabel: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 15px",
    border: "2px dashed #bbb",
    borderRadius: "8px",
    background: "#fafafa",
    textAlign: "center",
    cursor: "pointer",
  },
  addBtn: {
    padding: "10px 25px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  bannerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    background: "#fff",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  deleteBtn: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 0, 0, 0.85)",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default BannerAdmin;
