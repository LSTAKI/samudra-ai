"""
ORCA Backend — Configuration
Reads all settings from environment variables / .env file with zero-dependency fallback.
"""
import os

try:
    from pydantic_settings import BaseSettings
    from pydantic import Field

    class Settings(BaseSettings):
        # ── India Meteorological Department (IMD) ─────────────────────────────────
        imd_api_base_url: str = Field(
            default="https://api.imd.gov.in/api/v1",
            alias="IMD_API_BASE_URL",
        )
        imd_api_key: str = Field(default="", alias="IMD_API_KEY")

        # ── MOSDAC / ISRO Satellite Ingestion ─────────────────────────────────────
        mosdac_api_base_url: str = Field(default="", alias="MOSDAC_API_BASE_URL")
        mosdac_api_key: str = Field(default="", alias="MOSDAC_API_KEY")

        # ── External Agent Platform (Decoupled Intelligence Layer) ────────────────
        agent_platform_url: str = Field(default="", alias="AGENT_PLATFORM_URL")
        agent_platform_api_key: str = Field(default="", alias="AGENT_PLATFORM_API_KEY")

        # ── Copernicus Marine ─────────────────────────────────────────────────────
        copernicus_marine_username: str = Field(default="", alias="COPERNICUS_MARINE_USERNAME")
        copernicus_marine_password: str = Field(default="", alias="COPERNICUS_MARINE_PASSWORD")
        copernicus_wmts_url: str = Field(
            default="https://wmts.marine.copernicus.eu/teroWmts",
            alias="COPERNICUS_WMTS_URL"
        )

        # ── Redis / Caching ───────────────────────────────────────────────────────
        redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
        cache_ttl_seconds: int = Field(default=300, alias="CACHE_TTL_SECONDS")

        # ── Open-Meteo (public marine fallback, no key) ───────────────────────────
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
        sst_product_id: str = "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001"
        sst_dataset_id: str = "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2"
        sst_variable: str = "analysed_sst"

        wave_product_id: str = "GLOBAL_ANALYSISFORECAST_WAV_001_027"
        wave_dataset_id: str = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411"
        wave_variable: str = "VHM0"

        sla_product_id: str = "SEALEVEL_GLO_PHY_L4_NRT_008_046"
        sla_dataset_id: str = "cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506"
        sla_variable: str = "sla"

        chl_product_id: str = "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102"
        chl_dataset_id: str = "cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311"
        chl_variable: str = "CHL"

        cur_product_id: str = "GLOBAL_ANALYSISFORECAST_PHY_001_024"
        cur_dataset_id: str = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406"
        cur_variable_u: str = "uo"
        cur_variable_v: str = "vo"

        @property
        def has_imd_credentials(self) -> bool:
            return bool(self.imd_api_key)

        @property
        def has_copernicus_credentials(self) -> bool:
            return bool(self.copernicus_marine_username and self.copernicus_marine_password)

        @property
        def has_agent_platform(self) -> bool:
            return bool(self.agent_platform_url)

        @property
        def has_api_key(self) -> bool:
            return bool(self.api_key)

        model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "populate_by_name": True}

    settings = Settings()

except ImportError:
    class FallbackSettings:
        def __init__(self):
            self.imd_api_base_url = os.getenv("IMD_API_BASE_URL", "https://api.imd.gov.in/api/v1")
            self.imd_api_key = os.getenv("IMD_API_KEY", "")
            self.mosdac_api_base_url = os.getenv("MOSDAC_API_BASE_URL", "")
            self.mosdac_api_key = os.getenv("MOSDAC_API_KEY", "")
            self.agent_platform_url = os.getenv("AGENT_PLATFORM_URL", "")
            self.agent_platform_api_key = os.getenv("AGENT_PLATFORM_API_KEY", "")
            self.copernicus_marine_username = os.getenv("COPERNICUS_MARINE_USERNAME", "")
            self.copernicus_marine_password = os.getenv("COPERNICUS_MARINE_PASSWORD", "")
            self.copernicus_wmts_url = os.getenv("COPERNICUS_WMTS_URL", "https://wmts.marine.copernicus.eu/teroWmts")
            self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            self.cache_ttl_seconds = int(os.getenv("CACHE_TTL_SECONDS", "300"))
            self.open_meteo_marine_api = os.getenv("OPEN_METEO_API", "https://marine-api.open-meteo.com/v1/marine")
            self.frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
            self.port = int(os.getenv("PORT", "8000"))
            self.api_key = os.getenv("API_KEY", "")

            self.sst_product_id = "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001"
            self.sst_dataset_id = "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2"
            self.sst_variable = "analysed_sst"

            self.wave_product_id = "GLOBAL_ANALYSISFORECAST_WAV_001_027"
            self.wave_dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411"
            self.wave_variable = "VHM0"

            self.sla_product_id = "SEALEVEL_GLO_PHY_L4_NRT_008_046"
            self.sla_dataset_id = "cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506"
            self.sla_variable = "sla"

            self.chl_product_id = "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102"
            self.chl_dataset_id = "cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311"
            self.chl_variable = "CHL"

            self.cur_product_id = "GLOBAL_ANALYSISFORECAST_PHY_001_024"
            self.cur_dataset_id = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406"
            self.cur_variable_u = "uo"
            self.cur_variable_v = "vo"

        @property
        def has_imd_credentials(self) -> bool:
            return bool(self.imd_api_key)

        @property
        def has_copernicus_credentials(self) -> bool:
            return bool(self.copernicus_marine_username and self.copernicus_marine_password)

        @property
        def has_agent_platform(self) -> bool:
            return bool(self.agent_platform_url)

        @property
        def has_api_key(self) -> bool:
            return bool(self.api_key)

    settings = FallbackSettings()
