title �Ʋ�����Ŀ����
color 02
cls
@echo off
pushd "%~dp0"
set ANT="d:\Program Files\apache-ant\bin\ant.bat"
call %ANT% -buildfile build.xml
pause
exit