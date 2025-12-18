package com.tailwinddeprecated.lsp

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.redhat.devtools.lsp4ij.server.ProcessStreamConnectionProvider
import com.redhat.devtools.lsp4ij.server.StreamConnectionProvider
import com.redhat.devtools.lsp4ij.LanguageServerFactory
import com.tailwinddeprecated.util.NodeRunner
import java.io.File
import java.io.FileOutputStream
import java.nio.file.Files

/**
 * Factory for creating the Tailwind Deprecated LSP server connection.
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
    
    companion object {
        private val LOG = Logger.getInstance(TailwindDeprecatedConnectionProvider::class.java)
        
        // Lazy extraction of server file
        @Volatile
        private var extractedServerPath: String? = null
        private val extractionLock = Any()
    }
    
    init {
        try {
            val serverPath = getOrExtractServer()
            val nodePath = NodeRunner.findNodeExecutable()
            
            LOG.info("Tailwind Deprecated LSP: Node path = $nodePath")
            LOG.info("Tailwind Deprecated LSP: Server path = $serverPath")
            
            if (serverPath != null && nodePath != null) {
                val commands = listOf(
                    nodePath,
                    serverPath,
                    "--stdio"
                )
                
                LOG.info("Tailwind Deprecated LSP: Starting with commands = $commands")
                
                super.setCommands(commands)
                
                // Set working directory to project root
                project.basePath?.let { basePath ->
                    super.setWorkingDirectory(basePath)
                    LOG.info("Tailwind Deprecated LSP: Working directory = $basePath")
                }
            } else {
                LOG.warn("Tailwind Deprecated LSP: Cannot start - nodePath=$nodePath, serverPath=$serverPath")
            }
        } catch (e: Exception) {
            LOG.error("Tailwind Deprecated LSP: Failed to initialize", e)
        }
    }
    
    /**
     * Gets the server path, extracting from JAR if necessary.
     */
    private fun getOrExtractServer(): String? {
        synchronized(extractionLock) {
            // Check if already extracted and valid
            extractedServerPath?.let { path ->
                if (File(path).exists()) {
                    LOG.info("Tailwind Deprecated LSP: Using cached server at $path")
                    return path
                }
            }
            
            // Extract server to temp directory
            val tempDir = Files.createTempDirectory("tailwind-deprecated-lsp").toFile()
            val serverFile = File(tempDir, "server.js")
            
            LOG.info("Tailwind Deprecated LSP: Extracting server to $serverFile")
            
            try {
                // Extract the bundled server.js
                val inputStream = this::class.java.classLoader.getResourceAsStream("server/server.js")
                
                if (inputStream != null) {
                    inputStream.use { input ->
                        FileOutputStream(serverFile).use { output ->
                            input.copyTo(output)
                        }
                    }
                    
                    extractedServerPath = serverFile.absolutePath
                    LOG.info("Tailwind Deprecated LSP: Server extracted successfully to $extractedServerPath")
                    return extractedServerPath
                } else {
                    LOG.error("Tailwind Deprecated LSP: server/server.js not found in resources")
                    
                    // List available resources for debugging
                    val serverResource = this::class.java.classLoader.getResource("server")
                    LOG.info("Tailwind Deprecated LSP: server resource = $serverResource")
                }
            } catch (e: Exception) {
                LOG.error("Tailwind Deprecated LSP: Failed to extract server", e)
            }
            
            return null
        }
    }
    
    override fun toString(): String {
        return "TailwindDeprecatedConnectionProvider(project=${project.name})"
    }
}
