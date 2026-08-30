"""
ORCA Backend — Configuration
Reads all settings from environment variables / .env file.
"""
import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # ── LLM / Ollama ──────────────────────────────────────────────────────────
    ollama_api_url: str = Field(
        default="http://localhost:11434/api/chat",
        alias="OLLAMA_API_URL",
    )
    llm_model: str = Field(default="llama3.1", alias="LLM_MODEL")

    # ── Copernicus Marine ─────────────────────────────────────────────────────
    copernicus_marine_username: str = Field(default="", alias="COPERNICUS_MARINE_USERNAME")
    copernicus_marine_password: str = Field(default="", alias="COPERNICUS_MARINE_PASSWORD")

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # ── Open-Meteo (public, no key) ───────────────────────────────────────────
    open_meteo_marine_api: str = Field(
        default="https://marine-api.open-meteo.com/v1/marine",
        alias="OPEN_METEO_API",
    )

    # ── Server / CORS ─────────────────────────────────────────────────────────
    frontend_origin: str = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")
    port: int = Field(default=8000, alias="PORT")

    # ── Security ──────────────────────────────────────────────────────────────
    api_key: str = Field(default="", alias="API_KEY")

    # ── Copernicus Product / Dataset IDs ──────────────────────────────────────
    # Sea Surface Temperature (L4 NRT)
    sst_product_id: str = "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001"
    sst_dataset_id: str = "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2"
    sst_variable: str = "analysed_sst"

    # Wave Height (L4 NRT)
    wave_product_id: str = "GLOBAL_ANALYSISFORECAST_WAV_001_027"
    wave_dataset_id: str = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411"
    wave_variable: str = "VHM0"

    # Sea Level Anomaly
    sla_product_id: str = "SEALEVEL_GLO_PHY_L4_NRT_008_046"
    sla_dataset_id: str = "cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506"
    sla_variable: str = "sla"

    # Chlorophyll-a
    chl_product_id: str = "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102"
    chl_dataset_id: str = "cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311"
    chl_variable: str = "CHL"

    # Ocean Currents
    cur_product_id: str = "GLOBAL_ANALYSISFORECAST_PHY_001_024"
    cur_dataset_id: str = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406"
    cur_variable_u: str = "uo"
    cur_variable_v: str = "vo"

    @property
    def has_copernicus_credentials(self) -> bool:
        return bool(self.copernicus_marine_username and self.copernicus_marine_password)

    @property
    def has_api_key(self) -> bool:
        return bool(self.api_key)

    @property
    def ollama_available(self) -> bool:
        """Checked at runtime — not at startup."""
        return True  # adapter checks live

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "populate_by_name": True}


settings = Settings()
