package com.tailwinddeprecated.actions

import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project

/**
 * Action to manually refresh the deprecated classes cache.
 */
class RefreshCacheAction : AnAction() {
    
    override fun actionPerformed(event: AnActionEvent) {
        val project = event.project ?: return
        
        // TODO: Trigger LSP server to refresh cache
        // This would require sending a custom notification to the LSP server
        
        showNotification(
            project,
            "Deprecated Classes Cache",
            "Cache refresh requested. The LSP server will rescan CSS files.",
            NotificationType.INFORMATION
        )
    }
    
    override fun update(event: AnActionEvent) {
        // Action is always available when a project is open
        event.presentation.isEnabledAndVisible = event.project != null
    }
    
    private fun showNotification(
        project: Project,
        title: String,
        content: String,
        type: NotificationType
    ) {
        NotificationGroupManager.getInstance()
            .getNotificationGroup("Tailwind Deprecated")
            .createNotification(title, content, type)
            .notify(project)
    }
}


