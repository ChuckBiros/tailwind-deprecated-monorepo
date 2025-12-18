package com.tailwinddeprecated.util

import com.intellij.openapi.util.SystemInfo
import java.io.File

/**
 * Utility for finding and running Node.js.
 */
object NodeRunner {
    
    /**
     * Finds the Node.js executable on the system.
     * 
     * @return Path to the node executable, or null if not found
     */
    fun findNodeExecutable(): String? {
        // Check common locations based on OS
        val candidates = when {
            SystemInfo.isWindows -> listOf(
                "node.exe",
                System.getenv("PROGRAMFILES") + "\\nodejs\\node.exe",
                System.getenv("PROGRAMFILES(X86)") + "\\nodejs\\node.exe",
                System.getenv("APPDATA") + "\\nvm\\current\\node.exe",
            )
            SystemInfo.isMac -> listOf(
                "node",
                "/usr/local/bin/node",
                "/opt/homebrew/bin/node",
                System.getProperty("user.home") + "/.nvm/current/bin/node",
                "/usr/bin/node",
            )
            else -> listOf(
                "node",
                "/usr/bin/node",
                "/usr/local/bin/node",
                System.getProperty("user.home") + "/.nvm/current/bin/node",
            )
        }
        
        // First check if 'node' is in PATH
        if (isInPath("node")) {
            return if (SystemInfo.isWindows) "node.exe" else "node"
        }
        
        // Check specific locations
        for (candidate in candidates) {
            val file = File(candidate)
            if (file.exists() && file.canExecute()) {
                return file.absolutePath
            }
        }
        
        return null
    }
    
    /**
     * Checks if a command is available in the system PATH.
     */
    private fun isInPath(command: String): Boolean {
        return try {
            val process = ProcessBuilder()
                .command(if (SystemInfo.isWindows) "where" else "which", command)
                .start()
            
            process.waitFor() == 0
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Gets the Node.js version.
     * 
     * @param nodePath Path to the node executable
     * @return Version string, or null if unable to determine
     */
    fun getNodeVersion(nodePath: String): String? {
        return try {
            val process = ProcessBuilder()
                .command(nodePath, "--version")
                .start()
            
            if (process.waitFor() == 0) {
                process.inputStream.bufferedReader().readLine()?.trim()
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Checks if the installed Node.js version meets the minimum requirement.
     * 
     * @param nodePath Path to the node executable
     * @param minMajorVersion Minimum required major version (default: 18)
     * @return true if version is sufficient
     */
    fun isNodeVersionSufficient(nodePath: String, minMajorVersion: Int = 18): Boolean {
        val version = getNodeVersion(nodePath) ?: return false
        
        // Parse version like "v18.19.0" or "v20.10.0"
        val versionMatch = Regex("v?(\\d+)").find(version)
        val majorVersion = versionMatch?.groupValues?.get(1)?.toIntOrNull() ?: return false
        
        return majorVersion >= minMajorVersion
    }
}

