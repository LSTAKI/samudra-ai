"""
ORCA Backend — Unit Normalization
Strict unit conversion and canonical variable name resolution.
"""

# ─── Unit Converters ─────────────────────────────────────────────────────────

def kelvin_to_celsius(k: float) -> float:
    """Converts Kelvin to Celsius."""
    return round(k - 273.15, 4)


def celsius_to_kelvin(c: float) -> float:
    return round(c + 273.15, 4)


def ms_to_knots(ms: float) -> float:
    """Converts m/s to knots."""
    return round(ms * 1.94384, 3)


def knots_to_ms(knots: float) -> float:
    return round(knots / 1.94384, 3)


def pa_to_hpa(pa: float) -> float:
    return round(pa / 100.0, 2)


def normalize_sst(raw_value: float, raw_unit: str) -> float:
    """
    Returns SST in °C regardless of input unit.
    Copernicus raw NetCDF stores SST in Kelvin; WMTS returns it in Celsius.
    """
    if raw_unit.upper() in ("K", "KELVIN"):
        return kelvin_to_celsius(raw_value)
    return round(raw_value, 4)


def mackenzie_sound_speed(temp_c: float, salinity_psu: float, depth_m: float) -> float:
    """
    Mackenzie (1981) equation for speed of sound in seawater.
    Valid for: T: 2–30°C, S: 25–40 PSU, D: 0–8000 m.
    Returns sound speed in m/s.
    """
    t = temp_c
    s = salinity_psu
    d = depth_m
    c = (
        1448.96
        + 4.591 * t
        - 5.304e-2 * t**2
        + 2.374e-4 * t**3
        + 1.340 * (s - 35)
        + 1.630e-2 * d
        + 1.675e-7 * d**2
        - 1.025e-2 * t * (s - 35)
        - 7.139e-13 * t * d**3
    )
    return round(c, 2)


def seawater_density(temp_c: float, salinity_psu: float) -> float:
    """
    Simplified UNESCO formula for seawater density (kg/m³).
    Accurate to surface layer conditions.
    """
    t = temp_c
    s = salinity_psu
    rho_w = (
        999.842594
        + 6.793952e-2 * t
        - 9.095290e-3 * t**2
        + 1.001685e-4 * t**3
        - 1.120083e-6 * t**4
        + 6.536332e-9 * t**5
    )
    A = (
        8.24493e-1
        - 4.0899e-3 * t
        + 7.6438e-5 * t**2
        - 8.2467e-7 * t**3
        + 5.3875e-9 * t**4
    )
    B = -5.72466e-3 + 1.0227e-4 * t - 1.6546e-6 * t**2
    C = 4.8314e-4
    rho = rho_w + A * s + B * s**1.5 + C * s**2
    return round(rho, 4)


# ─── Canonical Variable Name Map ─────────────────────────────────────────────

CANONICAL_VARIABLE_NAMES = {
    # Copernicus raw → canonical
    "analysed_sst": "sst",
    "VHM0": "wave_height",
    "sla": "sea_level_anomaly",
    "CHL": "chlorophyll",
    "uo": "current_u",
    "vo": "current_v",
    # Open-Meteo
    "wave_height": "wave_height",
    "wind_speed_10m": "wind_speed",
    "wind_direction_10m": "wind_direction",
    "temperature_2m": "air_temperature",
}


def canonical(variable: str) -> str:
    return CANONICAL_VARIABLE_NAMES.get(variable, variable)
