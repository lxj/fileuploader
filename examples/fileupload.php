<?php
    sleep(3);
    $filedir = '../upload/';
    $http = '../upload/';
    $state = "error";
    if ((($_FILES ["file"] ["type"] == "image/gif") || ($_FILES ["file"] ["type"] == "image/png") || ($_FILES ["file"] ["type"] == "image/jpeg") || ($_FILES ["file"] ["type"] == "image/pjpeg")) && ($_FILES ["file"] ["size"] < 20000000000)) {
        if ($_FILES ["file"] ["error"] > 0) {
            //echo "Return Code: " . $_FILES ["file"] ["error"] . "<br />";
        } else {
            if (file_exists ($filedir . $_FILES ["file"] ["name"] )){
                $state = "sucess";
            } else {
                move_uploaded_file ( $_FILES ["file"] ["tmp_name"],$filedir.$_FILES ["file"] ["name"]);
                $state = "sucess";
            }
        }
    } else {
        $state = "error";
    }
    $newname = time();
    preg_match('/(.+?)(\.[^\.]+)$/',$_FILES ["file"] ["name"],$fileinfo);
    $newname = time();
    $filetype = $fileinfo[2];
    rename($filedir.$_FILES ["file"] ["name"],$filedir.$newname.$filetype);
    $imgurl = $http.$newname.$filetype;
    echo '{"state":"'.$state.'","src":"'.$http.$newname.$filetype.'"}';
?>
