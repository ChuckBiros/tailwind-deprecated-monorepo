package com.tailwinddeprecated.lsp

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.io.FileUtil
import com.redhat.devtools.lsp4ij.server.ProcessStreamConnectionProvider
import com.redhat.devtools.lsp4ij.server.StreamConnectionProvider
import com.redhat.devtools.lsp4ij.LanguageServerFactory
import com.tailwinddeprecated.util.NodeRunner
import java.io.File
import java.io.FileOutputStream
import java.nio.file.Files
import java.nio.file.Path

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
    
    companion object {
        private val LOG = Logger.getInstance(TailwindDeprecatedConnectionProvider::class.java)
        
        // Lazy extraction of server files
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
                    return path
                }
            }
            
            // Extract server to temp directory
            val tempDir = Files.createTempDirectory("tailwind-deprecated-lsp").toFile()
            tempDir.deleteOnExit()
            
            LOG.info("Tailwind Deprecated LSP: Extracting server to $tempDir")
            
            try {
                extractResourceDirectory("server", tempDir)
                
                val mainJsPath = File(tempDir, "server/main.js")
                if (mainJsPath.exists()) {
                    extractedServerPath = mainJsPath.absolutePath
                    return extractedServerPath
                }
                
                // Try alternative path
                val altMainJsPath = File(tempDir, "main.js")
                if (altMainJsPath.exists()) {
                    extractedServerPath = altMainJsPath.absolutePath
                    return extractedServerPath
                }
                
                LOG.warn("Tailwind Deprecated LSP: main.js not found in extracted files")
                LOG.warn("Tailwind Deprecated LSP: Contents of $tempDir: ${tempDir.listFiles()?.map { it.name }}")
                
            } catch (e: Exception) {
                LOG.error("Tailwind Deprecated LSP: Failed to extract server", e)
            }
            
            return null
        }
    }
    
    /**
     * Extracts a resource directory from the JAR to a target directory.
     */
    private fun extractResourceDirectory(resourcePath: String, targetDir: File) {
        val classLoader = this::class.java.classLoader
        
        // List of known files to extract
        val filesToExtract = listOf(
            "server/main.js",
            "server/main.js.map",
            "server/LspServer.js",
            "server/index.js",
            "server/adapters/DiagnosticAdapter.js",
            "server/adapters/LspLogger.js",
            "server/adapters/index.js",
            "core/index.js",
            "core/css/CssParser.js",
            "core/css/CssScanner.js",
            "core/css/index.js",
            "core/detection/ClassDetector.js",
            "core/detection/index.js",
            "core/detection/patterns/ClassPattern.js",
            "core/detection/patterns/PatternRegistry.js",
            "core/detection/patterns/builtinPatterns.js",
            "core/detection/patterns/index.js",
            "core/cache/DeprecatedClassCache.js",
            "core/cache/index.js",
            "config/Settings.js",
            "config/FileExtensions.js",
            "config/index.js",
            "types/index.js",
            "types/DeprecatedClass.js",
            "types/ClassUsage.js",
            "types/DiagnosticResult.js",
            "types/FileChange.js",
            "utils/index.js",
            "utils/regex.js",
            "utils/logger.js",
            "index.js"
        )
        
        for (file in filesToExtract) {
            val resourceName = "$resourcePath/$file"
            val inputStream = classLoader.getResourceAsStream(resourceName)
            
            if (inputStream != null) {
                val targetFile = File(targetDir, file)
                targetFile.parentFile?.mkdirs()
                
                inputStream.use { input ->
                    FileOutputStream(targetFile).use { output ->
                        input.copyTo(output)
                    }
                }
                
                LOG.debug("Extracted: $resourceName -> $targetFile")
            }
        }
    }
    
    override fun toString(): String {
        return "TailwindDeprecatedConnectionProvider(project=${project.name})"
    }
}
