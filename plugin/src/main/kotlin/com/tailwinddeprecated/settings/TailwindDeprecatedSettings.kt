package com.tailwinddeprecated.settings

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import com.intellij.util.xmlb.XmlSerializerUtil

/**
 * Persistent settings for the Tailwind Deprecated plugin.
 */
@State(
    name = "TailwindDeprecatedSettings",
    storages = [Storage("tailwind-deprecated.xml")]
)
class TailwindDeprecatedSettings : PersistentStateComponent<TailwindDeprecatedSettings> {
    
    /** Whether the plugin is enabled */
    var enabled: Boolean = true
    
    /** Severity level for diagnostics: error, warning, information, hint */
    var severity: String = "warning"
    
    /** Custom CSS glob patterns (comma-separated) */
    var cssGlobPatterns: String = "**/*.css,**/*.scss"
    
    /** Directories to exclude (comma-separated) */
    var excludeDirs: String = "node_modules,dist,build,.git"
    
    override fun getState(): TailwindDeprecatedSettings = this
    
    override fun loadState(state: TailwindDeprecatedSettings) {
        XmlSerializerUtil.copyBean(state, this)
    }
    
    companion object {
        /**
         * Gets the singleton instance of the settings.
         */
        fun getInstance(): TailwindDeprecatedSettings {
            return ApplicationManager.getApplication()
                .getService(TailwindDeprecatedSettings::class.java)
        }
    }
    
    /**
     * Converts CSS glob patterns to a list.
     */
    fun getCssGlobPatternsList(): List<String> {
        return cssGlobPatterns
            .split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
    }
    
    /**
     * Converts exclude dirs to a list.
     */
    fun getExcludeDirsList(): List<String> {
        return excludeDirs
            .split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
    }
}


