import { Logger } from "../../util";
import { ItemID } from "../ItemID";
import { Archive } from "../archive/archive";
import { SaveData } from "../save-data/save";

// Probably going to scrap this; Originally used info about the computer to generate the ids (e.g. time spent in user, number of cores, etc.) but just went with using UUID

enum IDType { 
    Archive,
    Save
}

class IDBuilder {

    idType: IDType = IDType.Save;

    static ARCHIVE_PREFIX = "AC6SMA";
    static SAVE_PREFIX = "AC6SMS"

    constructor() {
    }

    update() {

    }

    setArchive() {
        this.idType = IDType.Archive;        
    }

    setSave() {
        this.idType = IDType.Save;
    }

    buildID(): ItemID {
        switch (this.idType) {
            case IDType.Archive:
                return `${IDBuilder.ARCHIVE_PREFIX}-${crypto.randomUUID()}`;

            case IDType.Save:
                return `${IDBuilder.SAVE_PREFIX}-${crypto.randomUUID()}`;
        
            default:
                Logger.error("Desired ID Type not known");
                throw new Error("Desired ID Type not known");
        }
    }

    permute() {

    }
}

export class IDService {

    idBuilder: IDBuilder;
    ids: Set<ItemID>;
    
    constructor() {
        this.ids = new Set<ItemID>();
        this.idBuilder = new IDBuilder();
    }

    get_new_ArchiveID(): ItemID {
        this.idBuilder.setArchive();
        return this.get_new_id();
    }

    get_new_SaveID(): ItemID {
        this.idBuilder.setSave();
        return this.get_new_id();
    }

    private get_new_id(): ItemID {
        // construct a new id from the following components:
        // 'AC6SM-{first cpu idle time}{endianness}-{free memory}-{timeStamp}
        this.idBuilder.update();
        return this.validate_id();
    }

    private validate_id(): ItemID {
        while(this.ids.has(this.idBuilder.buildID())) {
            // permute id until it doesn't
            this.idBuilder.permute();
        }

        const id = this.idBuilder.buildID();
        this.ids.add(id);
        return id;
    }

    uses_id(id: ItemID): boolean {
        return this.ids.has(id);
    }


    // Adds archive/save data to the IDService
    // if id conflicts with a known one, a new id is generated and asssigned to the obj
    /* Usage:

        given `archive`:

        archive = idService.add_archive(archive) // only adds archive ID
        // OR
        archive = idService.add_saves(archive) // only adds saves in the archive
        // OR
        archive = idService.add_saves_and_archive(archive) // adds both archiveID and saveID to the service

    */
    add_archive(archive: Archive): Archive {
        return this.resolve_archive(archive);  
    }

    private resolve_archive(archive: Archive): Archive {
        return archive;
    }

    add_saves_and_archive(archive: Archive): Archive {
        return archive;
    }

    add_saves(archive: Archive): Archive {
        return archive;
    }

    add_save(save: SaveData): SaveData {
        return this.resolve_save(save);
    }

    private resolve_save(save: SaveData): SaveData {
        let idCandidate = save.getMetadata().getID();
        while(this.ids.has(idCandidate)) {
            idCandidate = this.get_new_SaveID();
        }

        save.getMetadata().setID(idCandidate);
        return save;
    }
}