import urllib.request
import urllib.parse

# Standard NRT configurations
sst_layer = "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst"
wave_layer = "GLOBAL_ANALYSISFORECAST_WAV_001_027/cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411/VHM0"
chl_layer = "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102/cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311/CHL"
sla_layer = "SEALEVEL_GLO_PHY_L4_NRT_008_046/cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506/sla"

layers = [
    ("SST", sst_layer, "2026-08-28T00:00:00Z"),
    ("WAVE", wave_layer, "2026-08-28T00:00:00Z"),
    ("CHL", chl_layer, "2026-08-28T00:00:00Z"),
    ("SLA", sla_layer, "2026-08-28T00:00:00Z")
]

base_url = "https://wmts.marine.copernicus.eu/teroWmts"

for name, l_path, t_val in layers:
    params = urllib.parse.urlencode({
        "SERVICE": "WMTS",
        "VERSION": "1.0.0",
        "REQUEST": "GetTile",
        "LAYER": l_path,
        "STYLE": "default",
        "FORMAT": "image/png",
        "TILEMATRIXSET": "EPSG:3857",
        "TIME": t_val
    })
    tile_url = f"{base_url}?{params}&TILEMATRIX=5&TILEROW=15&TILECOL=23"
    
    try:
        req = urllib.request.Request(tile_url, headers={"User-Agent": "ORCA-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print(f'[PASS] {name} Tile -> HTTP {resp.status} ({len(data)} bytes)')
    except Exception as e:
        print(f'[FAIL] {name} Tile -> {e}')
        print(f'   URL: {tile_url}')
