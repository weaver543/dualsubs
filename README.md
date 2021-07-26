# Dualsubs

This program is used to display movie subtitles on a device (PC, phone, tablet/iPad) while the movie plays on a computer in VLC

It supports 2 subtitles files in srt format, which can be downloaded from a site like http://opensubtitles.org

The perl server script "subserver.pl" has to run on the machine that is running VLC, defaults to port 8081

You can then invoke it in your browser by opening (for example) http://myserver:8081/subs.html"

syntax to invoke vlc:
  * on Linux: /usr/bin/vlc --http-host=127.0.0.1 --http-port=8080
  * on Windows: 
      * cd \program files (x86))\VIdeoLAN/VLC 
      * vlc.exe --http-host=127.0.0.1 --http-port=8080
