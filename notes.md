# Armored Core 6 Save Manager Notes

_This file is not meant to contain usage notes, but rather implementation notes._

## Folder Archive Format

The `FolderArchive` format is just a standard directory (while could make it a .zip, seems like too much for a simple save manager). Each direct child in the directory is a folder with its name as the Save ID. Then, each Save ID folder contains an `AC6000.sl2` file and a `AC6Save.json` file.

While the archive folder nor the save file folder necessarily matter, in order to prevent Windows from simply not creating the folder and thus losing the save, the archive folder name will be the archive name and the archive id separated by an underscore. The save folder name will be the name of the save and the save id, also separated by an underscore.

Additionally, in the direct child directory of `archive`, the will be a `AC6Archive.json` file that contains data about the archive (most importantly the id and name of the archive). 

`Example folder tree`
-
- \<Armored Core 6 Archive_AC6SMA-14LE-11234-1706907935108'>
    - \<`AC6Archive.json`>
    - \<AC6 Save_AC6SMS-0LE-17976931348623157-1706907935108>
        - `AC6SM-SaveMetadata.json`
        - `AC6000.sl2`


`metadata.json` stores the relevant fields of the save:

- Save ID
- relative path (from the `.archive` file)
- given save name
- date last modified
- whether the save is for a modded game
- any notes the user wants to add (maybe at what part of the game the save is at and/or what mods were active)


## Notes about the save file

It should be noted that since each completed save is around 30MB, in order to keep memory usage low, we shouldn't really store the save data in memory at all times. Thus, unless there's a need to do it, just refer to the save file path instead of loading it into memory.

Another thing to note is there are can also be many files present in the save data, namely an additional `AC60000.sl2.bak` and `steam_autocoud.vdf`. AFAIK, we should be able to just completely ignore these (although we might want to also backup the backup).

## TODO
Need to have the following buttons for `Archive` ROW:
- Export Archive (maybe from zip, later feature)
- Import Archive (maybe from zip, later feature)
- Delete Archive (ask for confirmation, later feature)
- Clone Archive (later feature)
- Create New Archive
- Settings Menu? Either that or more buttons, { Set Exec Path, Add Archive Base file, Set game as offline/online }
- Run Game

Within `Save` view, need:
- Import Save (zip)
- Export Save (zip)
- Move Save (later feature)
- Clone Save
- Set Save as active
- Backup current active save in Archive