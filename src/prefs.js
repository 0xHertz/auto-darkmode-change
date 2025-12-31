import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AutoDarkmodePrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    window.set_default_size(480, 420);
    window.set_search_enabled(false);

    const page = new Adw.PreferencesPage({
      title: _("Auto Darkmode Switcher"),
    });
    window.add(page);

    /* ================== Location ================== */

    const locationGroup = new Adw.PreferencesGroup({
      title: _("Location"),
      description: _("Used to calculate sunrise and sunset"),
    });
    page.add(locationGroup);

    const latRow = new Adw.EntryRow({
      title: _("Latitude"),
      text: settings.get_double("latitude").toString(),
    });
    latRow.connect("changed", () => {
      const v = parseFloat(latRow.text);
      if (!Number.isNaN(v)) settings.set_double("latitude", v);
    });

    const lngRow = new Adw.EntryRow({
      title: _("Longitude"),
      text: settings.get_double("longitude").toString(),
    });
    lngRow.connect("changed", () => {
      const v = parseFloat(lngRow.text);
      if (!Number.isNaN(v)) settings.set_double("longitude", v);
    });

    locationGroup.add(latRow);
    locationGroup.add(lngRow);

    /* ================== Light / Dark Themes ================== */

    page.add(this._createThemeGroup(settings, "light", _("Light Mode")));
    page.add(this._createThemeGroup(settings, "dark", _("Dark Mode")));

    /* ===== Apply 按钮 ===== */
    const actionGroup = new Adw.PreferencesGroup({
      title: "Actions",
    });
    page.add(actionGroup);

    const applyRow = new Adw.ActionRow({
      title: "Apply theme now",
      subtitle: "Apply the current light/dark configuration immediately",
    });

    const applyButton = new Gtk.Button({
      label: "Apply",
      valign: Gtk.Align.CENTER,
    });

    applyButton.connect("clicked", () => {
      // 触发一次 change 信号
      const current = settings.get_boolean("apply-now");
      settings.set_boolean("apply-now", !current);
    });

    applyRow.add_suffix(applyButton);
    actionGroup.add(applyRow);
  }

  /* ---------- helper: theme group ---------- */

  _createThemeGroup(settings, prefix, title) {
    const group = new Adw.PreferencesGroup({
      title,
    });

    group.add(this._themeRow(settings, prefix, "gtk-theme", _("GTK Theme")));
    group.add(
      this._themeRow(settings, prefix, "color-scheme", _("Color Scheme")),
    );
    group.add(this._themeRow(settings, prefix, "icon-theme", _("Icon Theme")));
    group.add(
      this._themeRow(settings, prefix, "cursor-theme", _("Cursor Theme")),
    );
    group.add(
      this._themeRow(settings, prefix, "shell-theme", _("Shell Theme")),
    );

    return group;
  }

  _themeRow(settings, prefix, key, title) {
    const fullKey = `${prefix}-${key}`;

    const row = new Adw.EntryRow({
      title,
      text: settings.get_string(fullKey),
    });

    row.connect("changed", () => {
      settings.set_string(fullKey, row.text);
    });

    return row;
  }
}
