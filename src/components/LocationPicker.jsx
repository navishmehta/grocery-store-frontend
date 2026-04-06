import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LocationPicker = ({ onAddressFetched }) => {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const getPreciseLocation = async () => {
        setLoading(true);

        // 1. Check if browser supports Geolocation
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", "danger");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // 2. Use OpenStreetMap's Nominatim (Free & Lifetime)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );

                    if (!response.ok) throw new Error("Failed to fetch address");

                    const data = await response.json();

                    if (data && data.display_name) {
                        // Success! This returns a full street address
                        // We also get 'address' object with 'road', 'suburb', 'city', 'postcode', etc. if needed
                        onAddressFetched(data.display_name);
                        showToast("Location fetched successfully!", "success");
                    } else {
                        showToast("No address found for this location.", "warning");
                    }
                } catch (err) {
                    showToast("Error fetching address: " + err.message, "danger");
                } finally {
                    setLoading(false);
                }
            },
            (geoError) => {
                setLoading(false);
                let message = "Could not get your location.";
                if (geoError.code === 1) message = "Location permission denied.";
                else if (geoError.code === 2) message = "Location unavailable.";
                else if (geoError.code === 3) message = "Location timeout.";
                showToast(message, "danger");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <button
            type="button"
            onClick={getPreciseLocation}
            disabled={loading}
            className={`btn-location-picker ${loading ? 'loading' : ''}`}
            title="Get Precise Address"
        >
            {loading ? (
                <Loader2 className="spinner" size={18} />
            ) : (
                <MapPin size={18} />
            )}
            <span>{loading ? "Locating..." : "Auto-fill Address"}</span>
        </button>
    );
};

export default LocationPicker;
