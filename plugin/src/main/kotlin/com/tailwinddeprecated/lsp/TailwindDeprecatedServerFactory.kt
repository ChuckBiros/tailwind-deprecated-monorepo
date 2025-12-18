package com.tailwinddeprecated.lsp

import com.intellij.openapi.project.Project
import com.redhat.devtools.lsp4ij.server.ProcessStreamConnectionProvider
import com.redhat.devtools.lsp4ij.server.StreamConnectionProvider
import com.redhat.devtools.lsp4ij.LanguageServerFactory
import com.tailwinddeprecated.util.NodeRunner
import java.io.File

/**
 * Factory for creating the Tailwind Deprecated LSP server connection.
 * 
 * This factory is registered in plugin.xml and creates the connection
 * to the Node.js LSP server bundled with the plugin.
 */
class TailwindDeprecatedServerFactory : LanguageServerFactory {
    
    override fun createConnectionProvider(project: Project): StreamConnectionProvider {
        return TailwindDeprecatedConnectionProvider(project)
    }
}

/**
 * Connection provider that starts the Node.js LSP server.
 */
class TailwindDeprecatedConnectionProvider(
    private val project: Project
) : ProcessStreamConnectionProvider() {
    
    init {
        val serverPath = getServerPath()
        val nodePath = NodeRunner.findNodeExecutable()
        
        if (serverPath != null && nodePath != null) {
            val commands = listOf(
                nodePath,
                serverPath,
                "--stdio"
            )
            
            super.setCommands(commands)
            
            // Set working directory to project root
            project.basePath?.let { basePath ->
                super.setWorkingDirectory(basePath)
            }
        }
    }
    
    /**
     * Gets the path to the bundled LSP server.
     */
    private fun getServerPath(): String? {
        // Try to find the server in the plugin's resources
        val pluginPath = getPluginPath()
        if (pluginPath != null) {
            val serverFile = File(pluginPath, "server/server/main.js")
            if (serverFile.exists()) {
                return serverFile.absolutePath
            }
            
            // Fallback to alternative path
            val altServerFile = File(pluginPath, "server/main.js")
            if (altServerFile.exists()) {
                return altServerFile.absolutePath
            }
        }
        
        return null
    }
    
    /**
     * Gets the plugin installation path.
     */
    private fun getPluginPath(): String? {
        val resource = this::class.java.classLoader.getResource("server")
        return resource?.path?.let { path ->
            // Handle both file: and jar: URLs
            if (path.startsWith("file:")) {
                path.removePrefix("file:")
            } else {
                path
            }
        }?.substringBefore("!")?.removeSuffix("/server")
    }
    
    override fun toString(): String {
        return "TailwindDeprecatedConnectionProvider(project=${project.name})"
    }
}

