!include "MUI2.nsh"
!include "nsDialogs.nsh"

Var Dialog
Var StationEdit
Var Station

; Insert a custom page after the directory selection to prompt for station
!macro customPageAfterChangeDir
  PageEx custom
    PageCallbacks StationPageCreate StationPageLeave
  PageExEnd
!macroend

Function StationPageCreate
  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 24u "Enter station (e.g., b12_vitalsign):"
  Pop $0
  ${NSD_CreateText} 0 26u 100% 12u ""
  Pop $StationEdit

  nsDialogs::Show
FunctionEnd

Function StationPageLeave
  ${NSD_GetText} $StationEdit $Station
  StrCmp $Station "" 0 +2
  StrCpy $Station "vitalsign"
FunctionEnd

!macro customInstall
  ; Persist station to AppData for the app to read on first launch
  SetShellVarContext current
  CreateDirectory "$APPDATA\Display Checkup"
  FileOpen $0 "$APPDATA\Display Checkup\station.txt" w
  FileWrite $0 "$Station"
  FileClose $0

  ; Optional: append station arg to shortcuts
  ; (electron-builder defines ${APP_EXECUTABLE_FILENAME})
  CreateShortCut "$DESKTOP\Display Checkup.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--station=$Station"
  CreateShortCut "$SMPROGRAMS\Display Checkup\Display Checkup.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--station=$Station"
!macroend