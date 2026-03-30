import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function EditProduct() {
    const { id } = useParams();
    const [form, setForm] = useState({});
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get(`/products/${id}`).then(res => setForm(res.data));
    }, [id]);

    const handleUpdate = async () => {
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (image) {
            formData.append("image", image);
        }

        await API.put(`/products/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        navigate("/admin/products");
    };

    return (
        <div>
            <h2>Edit Product</h2>

            <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input value={form.price || ""} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" />

            <button onClick={handleUpdate}>Update</button>
        </div>
    );
}