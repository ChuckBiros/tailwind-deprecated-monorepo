plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.9.21"
    id("org.jetbrains.intellij.platform") version "2.2.1"
}

group = "com.tailwinddeprecated"
version = "1.0.0"

repositories {
    mavenCentral()
    
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        rider("2023.3")
        
        // LSP4IJ plugin for LSP support
        plugin("com.redhat.devtools.lsp4ij:0.0.2")
        
        pluginVerifier()
    }
}

kotlin {
    jvmToolchain(17)
}

intellijPlatform {
    pluginConfiguration {
        id = "com.tailwinddeprecated.plugin"
        name = "Tailwind Deprecated"
        version = project.version.toString()
        
        ideaVersion {
            sinceBuild = "233"
            untilBuild = "243.*"
        }
        
        vendor {
            name = "ChuckBiros"
            url = "https://github.com/ChuckBiros/tailwind-deprecated-monorepo"
        }
    }
    
    signing {
        certificateChain = providers.environmentVariable("CERTIFICATE_CHAIN")
        privateKey = providers.environmentVariable("PRIVATE_KEY")
        password = providers.environmentVariable("PRIVATE_KEY_PASSWORD")
    }
    
    publishing {
        token = providers.environmentVariable("PUBLISH_TOKEN")
    }
    
    pluginVerification {
        ides {
            recommended()
        }
    }
}

// Task to copy the built LSP server to the plugin resources
tasks.register<Copy>("copyLspServer") {
    from("../lsp-server/dist")
    into("src/main/resources/server")
    
    // Also copy node_modules dependencies needed at runtime
    from("../lsp-server/node_modules") {
        into("node_modules")
        include("**/package.json")
        include("**/*.js")
        include("**/*.json")
        exclude("**/test/**")
        exclude("**/*.ts")
        exclude("**/tsconfig.json")
    }
}

// Clean the copied server files
tasks.register<Delete>("cleanLspServer") {
    delete("src/main/resources/server")
}

tasks.named("clean") {
    dependsOn("cleanLspServer")
}

tasks.named("processResources") {
    dependsOn("copyLspServer")
}
