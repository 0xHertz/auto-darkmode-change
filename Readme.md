# What does this script do?

This is an automatic theme switcher for Ubuntu 22.04 and 24.04.

It does the following:

* Sets the light-theme at sunrise and automatically switches to the dark-theme at sunset.
  Affects the following:
  
  * GTK-Theme
  * Icon-Theme
  * GNOME Shell Theme
  * GNOME Terminal profile
  
* Sets the prefer-light/prefer-dark value to indicate to programs and websites which version you prefer.

* Sets the mouse cursor, if you use the Cinnamon desktop.

  > fix:
  >
  > change gnome shell switcher from
  >
  > ```shell
  > gsettings set org.gnome.shell.extensions.user-theme name "$LIGHT_SHELL_THEME"
  > ```
  >
  > to
  >
  > ```shell
  > gsettings --schemadir $HOME/.local/share/gnome-shell/extensions/user-theme@gnome-shell-extensions.gcampax.github.com/schemas set org.gnome.shell.extensions.user-theme name "$LIGHT_SHELL_THEME"
  > ```
  >
  > in order to solve
  >
  > ```shell
  > $> gsettings set org.gnome.shell.extensions.user-theme name "Yaru-blue"
  > No such schema “org.gnome.shell.extensions.user-theme”
  > ```

## gnome-extension

* you can also use gnome extension in `src` without install anything.

## Installation

1. Open the `auto-darkmode-switcher.sh` script with a text-editor and add your latitude, longitude and preferred themes.
2. Execute the install script once: `sh ./install.sh`.
3. If it complains about dependencies, install them and execute it again.

## Dependencies

Depends on the program `hdate` to get an accurate sunrise and sunset time for your location. Uses the `gnome-shell-extensions` package to switch the Gnome Shell Theme.

## Troubleshooting

Execute `systemctl --user list-timers`. If all went well, there should be a "auto-darkmode-switcher.time"-unit in the list. Exit by pressing <kbd>Q</kbd>.

## How to stop the script

Execute `systemctl --user stop auto-darkmode-switcher.timer`.

Follow the install-instructions if you want to start it again.
