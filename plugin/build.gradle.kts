plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.9.21"
    id("org.jetbrains.intellij") version "1.17.0"
}

group = "com.tailwinddeprecated"
version = "1.0.0"

repositories {
    mavenCentral()
}

// Configure Gradle IntelliJ Plugin
intellij {
    version.set("2023.3")
    type.set("RD") // Rider
    
    plugins.set(listOf(
        "com.redhat.devtools.lsp4ij:0.0.2" // LSP4IJ plugin
    ))
}

tasks {
    // Set the JVM compatibility versions
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }
    
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "17"
    }

    patchPluginXml {
        sinceBuild.set("233")
        untilBuild.set("243.*")
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
    
    // Copy the LSP server to resources before building
    processResources {
        dependsOn(":copyLspServer")
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

