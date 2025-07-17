import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from './Toast.js'
function AuthPage({ setUser }) {
  const [toastMsg, setToastMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    gender: "prefer-not-to-say",
    age: "",
    interests: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      interests: formData.interests === "" ? "NA" : formData.interests,
      age: Number(formData.age),
    };

    try {
      const response = await fetch(`${process.env.socketurl}m/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {


        setUser(data.user);
        navigate("/chat");
      } else {
        setToastMsg("Age is required");
      }
    } catch (err) {
      setToastMsg("An error occurred");
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url("/Assets/back.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="bg-white rounded shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Welcome To ChatApp</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label>Gender</label>
            <select
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div className="mb-2">
            <label>Age</label>
            <input
              type="number"
              name="age"
              min="13"
              max="120"
              className="form-control"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Interests (comma-separated)</label>
            <input
              type="text"
              name="interests"
              placeholder="e.g. coding, dancing"
              className="form-control"
              value={formData.interests}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Start Chat
          </button>
        </form>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
      </div>
    </div>
  );
}

export default AuthPage;
