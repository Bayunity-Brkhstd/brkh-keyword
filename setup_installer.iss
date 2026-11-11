; =====================================================================
; Inno Setup Script for StockMeta Studio by BRKH STUDIO
; Version: 1.0.3
; Compiler: Inno Setup 6.x or newer (https://jrsoftware.org/isdl.php)
; =====================================================================

#define MyAppName "StockMeta Studio"
#define MyAppVersion "1.0.3"
#define MyAppPublisher "BRKH STUDIO"
#define MyAppExeName "StockMetaStudio.exe"
#define MyAppURL "https://drive.google.com/drive/folders/14724m0TmLfqovKGj26beYAigJTfuE6Zo"

[Setup]
; Unique App ID (Generated for StockMeta Studio)
AppId={{8B4A23D1-9F12-4C6E-9E4F-71285A09F103}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation Default Path & Start Menu Group
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes

; Output Configuration
OutputDir=dist\installer
OutputBaseFilename=StockMetaStudio_v1.0.3_Setup
SetupIconFile=public\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

; Compression & Modern Wizard Styling
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Standalone Executable (Hasil build PyInstaller --onefile)
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

; Opsional: Jika Anda menggunakan build folder (--onedir), hilangkan tanda titik koma (;) pada baris di bawah:
; Source: "dist\StockMetaStudio\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
