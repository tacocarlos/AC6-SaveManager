
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::{error, trace, info};
use simple_logger;
use tauri::api::path::{desktop_dir};
extern crate log;

use std::process::exit;
use std::{env};
use std::process::Command;
use std::fs;
use std::path::Path;
use tauri::Manager; // used to open dev tools in debug mode

use winreg::enums::*;
use winreg::RegKey;

#[tauri::command]
fn write(msg: &str) -> () {
    println!("{}", msg)
}

#[tauri::command]
fn error_msg(msg: &str) -> () {
    log::error!("\n\t{}", msg);
}

#[tauri::command]
fn warn_msg(msg: &str) -> () {
    log::warn!("\n\t{}", msg);
}

#[tauri::command]
fn info_msg(msg: &str) -> () {
    log::info!("\n\t{}", msg);
}

#[tauri::command]
fn debug_msg(msg: &str) -> () {
    log::debug!("\n\t{}", msg);
}

#[tauri::command]
fn trace_msg(msg: &str) -> () {
    log::trace!("\n\t{}", msg);
}

#[tauri::command]
fn launch_app(app_path: &str) -> bool {
    log::info!("[RUST] launching game");
    let dir = Path::new(app_path);
    let result = Command::new(app_path).current_dir(dir.parent().unwrap()).spawn();
    if result.is_ok() {
        log::info!("child process ok");
        return true;
    } else {
        log::error!("{}", result.err().unwrap());
        return false;
    }
}

#[tauri::command]
fn is_dir(file_path: &str) -> bool {
    let metadata = fs::metadata(file_path);
    if metadata.is_ok() {
        return metadata.unwrap().is_dir();
    }

    return false;
}

#[tauri::command]
fn is_file(file_path: &str) -> bool {
    let metadata = fs::metadata(file_path);
    if metadata.is_ok() {
        return metadata.unwrap().is_file();
    }

    return false;
}

#[tauri::command]
fn file_exists(file: &str) -> bool {
    return Path::new(file).exists();
}

#[tauri::command]
fn copy(from: &str, to: &str, overwrite: bool) -> bool {
    if !file_exists(from) || (file_exists(to) && !overwrite) {
        return false;
    }

    let metadata_res = fs::metadata(from);
    if metadata_res.is_err() {
        return false;
    }

    let metadata = metadata_res.unwrap();
    let ncopied = fs::copy(from, to).unwrap_or(0);
    return (ncopied == metadata.len()) && ncopied != 0;
}

#[tauri::command]
fn get_steam_install_path() -> String {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let steam = hklm.open_subkey("SOFTWARE\\WOW6432Node\\Valve\\Steam");
    if steam.is_err() {
        info!("Failed to get Steam subkey");
        return "".into();
    }

    let steam = steam.unwrap();


    let steam_path = steam.get_value("InstallPath");
    if steam_path.is_err() {
        info!("Failed to get Steam/InstallPath");
        return "".into();
    }
    let steam_path = steam_path.unwrap();
    
    if steam_path == "" {
        info!("Failed to get InstallPath from subkey");
        return "".into();
    }
    
    info!("Got '{}' as steam install path", steam_path);
    return steam_path;
}

#[tauri::command]
fn get_game_path() -> String {
    
    let backup_dir = String::from(desktop_dir().unwrap().to_str().unwrap());
    let steam_install = get_steam_install_path();
    if steam_install == "" {
        return backup_dir;
    }

    let steam_install_path: &Path = Path::new(steam_install.as_str());

    // we have the steam install path
    // check if we Armored Core 6 is installed to there
    let game_path_from_install = "steamapps/common/ARMORED CORE VI FIRES OF RUBICON/Game/start_protected_game.exe";
    let game_path = steam_install_path.join(game_path_from_install);

    if !game_path.exists() {
        info!("ArmoredCore6 doesn't exist");
        let common_dir = Path::new(steam_install.as_str()).join("steamapps/common/");
        return common_dir.to_str().unwrap().into();
    }

    return game_path.to_str().unwrap().into();
}

// TODO: for now, keep the more advanced io operations in frontend since I didn't think to put them here and just call it from frontend
//       however, will eventually move those operations to Rust (primarily `folder_archive.discover()`)

#[tauri::command]
fn scan_dir_for_saves(path: &str) -> Vec<String> {
    let dir = Path::new(path);
    if !dir.is_dir() {
        error!("{} was not a directory", path);
        return vec![];
    }

    let base_entries = fs::read_dir(dir);
    if base_entries.is_err() {
        error!("failed to read {}", path);
    }

    let mut saves_metadata_paths = Vec::new();
    for entry in base_entries.unwrap() {
        if entry.is_err() {
            continue;
        }
        let entry = entry.unwrap();
        let entry_path = entry.path();
        if !entry_path.is_dir() {
            continue;
        }

        // check if entry is a save folder
        trace!("Found save candidate at {}", entry_path.to_str().unwrap_or_default());        

        let entry_dir = fs::read_dir(entry_path);
        if entry_dir.is_err() {
            continue;
        }

        let mut metadata_path = String::new();
        let mut contains_save = false;

        entry_dir.unwrap().for_each(|entry| {
            if entry.is_err() {
                return;
            }
            let entry = entry.unwrap();

            match entry.path().file_name().unwrap().to_str().unwrap() {
                "AC6SM-SaveMetadata.json" => {
                    metadata_path += entry.path().to_str().unwrap();
                }

                "AC60000.sl2" => {
                    contains_save = true;
                }

                _ => {}
            }
        });

        if contains_save && metadata_path != "" {
            saves_metadata_paths.push(metadata_path);
        }
    }

    return saves_metadata_paths;
}

#[tauri::command]
fn open_in_explorer(path: &str) {
    Command::new("explorer")
        .args([path])
        .spawn()
        .unwrap();
    
    return ();
}

#[tauri::command]
fn open_file_in_explorer(path: &str) {
    Command::new("explorer")
        .args(["/select,",path])
        .spawn()
        .unwrap();
    
    return ();
}

fn main() {
    
    simple_logger::SimpleLogger::new().init().unwrap();

    if cfg!(windows) {
        log::info!("this is windows");
    } else if cfg!(unix) || cfg!(linux) {
        log::info!("this is a unix-like os");
    } else { 
        log::error!("Found unsupported OS");
        exit(-1);
    }

    // println!("Check that logger worked");

    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok( () )
        })
        .invoke_handler(tauri::generate_handler![write, 
            error_msg, warn_msg, info_msg, debug_msg, trace_msg,
            launch_app,
            is_dir, is_file, file_exists, copy,
            scan_dir_for_saves,
            get_steam_install_path, get_game_path,
            open_in_explorer, open_file_in_explorer
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // env::remove_var("RUST_LOG");
}
