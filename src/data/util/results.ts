/**
 * @deprecated Was originally going to return what type of error a file system operation would result in, but eventually scrapped it.
 * 
 *             Still present in some stuff that I'm going to clean up later
 */
enum fsResult {
    Ok,
    fnfErr, // File not found
    RmErr, // 'rm' err
    CpErr, // 'cp' err
    SorryErr, // really fucked up here
}