package com.tailwinddeprecated.settings

import com.intellij.openapi.options.Configurable
import com.intellij.openapi.ui.ComboBox
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.FormBuilder
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Settings UI for the Tailwind Deprecated plugin.
 */
class TailwindDeprecatedConfigurable : Configurable {
    
    private var mainPanel: JPanel? = null
    private var enabledCheckbox: JBCheckBox? = null
    private var severityCombo: ComboBox<String>? = null
    private var cssGlobField: JBTextField? = null
    private var excludeDirsField: JBTextField? = null
    
    override fun getDisplayName(): String = "Tailwind Deprecated"
    
    override fun createComponent(): JComponent {
        enabledCheckbox = JBCheckBox("Enable deprecated class detection")
        
        severityCombo = ComboBox(arrayOf("error", "warning", "information", "hint"))
        
        cssGlobField = JBTextField().apply {
            toolTipText = "Comma-separated glob patterns for CSS files"
        }
        
        excludeDirsField = JBTextField().apply {
            toolTipText = "Comma-separated directories to exclude from scanning"
        }
        
        mainPanel = FormBuilder.createFormBuilder()
            .addComponent(enabledCheckbox!!)
            .addLabeledComponent(JBLabel("Severity:"), severityCombo!!)
            .addLabeledComponent(JBLabel("CSS patterns:"), cssGlobField!!)
            .addLabeledComponent(JBLabel("Exclude directories:"), excludeDirsField!!)
            .addComponentFillVertically(JPanel(), 0)
            .panel
        
        return mainPanel!!
    }
    
    override fun isModified(): Boolean {
        val settings = TailwindDeprecatedSettings.getInstance()
        return enabledCheckbox?.isSelected != settings.enabled ||
               severityCombo?.selectedItem != settings.severity ||
               cssGlobField?.text != settings.cssGlobPatterns ||
               excludeDirsField?.text != settings.excludeDirs
    }
    
    override fun apply() {
        val settings = TailwindDeprecatedSettings.getInstance()
        settings.enabled = enabledCheckbox?.isSelected ?: true
        settings.severity = severityCombo?.selectedItem as? String ?: "warning"
        settings.cssGlobPatterns = cssGlobField?.text ?: "**/*.css,**/*.scss"
        settings.excludeDirs = excludeDirsField?.text ?: "node_modules,dist,build,.git"
    }
    
    override fun reset() {
        val settings = TailwindDeprecatedSettings.getInstance()
        enabledCheckbox?.isSelected = settings.enabled
        severityCombo?.selectedItem = settings.severity
        cssGlobField?.text = settings.cssGlobPatterns
        excludeDirsField?.text = settings.excludeDirs
    }
    
    override fun disposeUIResources() {
        mainPanel = null
        enabledCheckbox = null
        severityCombo = null
        cssGlobField = null
        excludeDirsField = null
    }
}


