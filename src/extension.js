import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { getSunTimes } from "./suntimes.js";

/* ====== 配置区（等价于你脚本里的变量） ====== */

// 经纬度
const LAT = 34.274342;
const LNG = 108.889191;

// 亮 / 暗 主题
const LIGHT = {
  gtk: "Yaru-blue",
  icon: "WhiteSur-light",
  cursor: "macOS-White",
  shell: "Yaru-blue",
};

const DARK = {
  gtk: "Yaru-blue-dark",
  icon: "WhiteSur-dark",
  cursor: "macOS",
  shell: "Yaru-blue-dark",
};
function loadUserThemeSettings() {
  const SCHEMA_ID = "org.gnome.shell.extensions.user-theme";

  const defaultSource = Gio.SettingsSchemaSource.get_default();

  // 系统级安装（最优路径）
  let schema = defaultSource.lookup(SCHEMA_ID, false);
  if (schema) {
    log("[AutoDarkmode] user-theme: system installed");
    return new Gio.Settings({ settings_schema: schema });
  }

  // 用户级安装（等价 --schemadir）
  const schemaDir = GLib.build_filenamev([
    GLib.get_home_dir(),
    ".local",
    "share",
    "gnome-shell",
    "extensions",
    "user-theme@gnome-shell-extensions.gcampax.github.com",
    "schemas",
  ]);

  const userSource = Gio.SettingsSchemaSource.new_from_directory(
    schemaDir,
    defaultSource,
    false,
  );

  schema = userSource.lookup(SCHEMA_ID, false);
  if (schema) {
    log("[AutoDarkmode] user-theme: user installed");
    return new Gio.Settings({ settings_schema: schema });
  }

  // 都不存在 = 明确失败
  throw new Error("User Themes extension not installed");
}

/* ============================================ */

export default class AutoDarkmodeSwitcher {
  enable() {
    this._iface = new Gio.Settings({
      schema: "org.gnome.desktop.interface",
    });

    this._userThemeSettings = loadUserThemeSettings();

    this._timer = 0;
    this._reschedule();
  }

  disable() {
    if (this._timer) {
      GLib.source_remove(this._timer);
      this._timer = 0;
    }
  }

  _reschedule() {
    const now = new Date();
    const { sunrise, sunset } = getSunTimes(now, LAT, LNG);
    log(`[AutoDarkmode] Sunrise: ${sunrise}, Sunset: ${sunset}`);

    let next;
    let mode;

    const lastSunrise =
      sunrise <= now ? sunrise : new Date(sunrise.getTime() - 86400000);
    const lastSunset =
      sunset <= now ? sunset : new Date(sunset.getTime() - 86400000);

    if (lastSunrise > lastSunset) {
      // 最近的是日出 → 白天
      mode = LIGHT;
      next = sunset > now ? sunset : sunrise;
    } else {
      // 最近的是日落 → 夜晚
      mode = DARK;
      next = sunrise > now ? sunrise : sunset;
    }
    log(`[AutoDarkmode] ${mode === LIGHT ? "LIGHT" : "DARK"} mode at ${now}`);
    this._apply(mode);

    const delay = Math.max(5, Math.floor((next - now) / 1000));

    this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, delay, () => {
      this._reschedule();
      return GLib.SOURCE_REMOVE;
    });
  }

  _apply(theme) {
    this._setIfChanged(this._iface, "gtk-theme", theme.gtk);
    this._setIfChanged(this._iface, "icon-theme", theme.icon);
    this._setIfChanged(this._iface, "cursor-theme", theme.cursor);
    this._setIfChanged(this._userTheme, "name", theme.shell);
  }

  _setIfChanged(settings, key, value) {
    if (!settings) return;

    if (settings.get_string(key) !== value) {
      log(`[AutoDarkmode] ${settings.get_string(key)} -> ${key} -> ${value}`);
      settings.set_string(key, value);
    }
  }
}
