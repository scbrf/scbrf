Scarborough 的灵感来源是 [Livid 的 Planet](https://github.com/Planetable/Planet)。

因为 Planet 暂时只支持 MacOS，并且是12.1 以后的MacOS，于是我决定使用 Electron 简单制作一个 Planet 的克隆版本，以便快速支持在更多的系统上使用 Planet 的功能，由于 Electron 对比 Swift 原生开发在 MacOS上天生的弱项， Electron 版本的 Scarborough 功能更少，也没有 Planet 美观优雅，建议具备条件的同学优先考虑使用 Planet ，在受制于客观条件无法使用Planet以后再考虑使用Scarborough。  

[![IMAGE ALT TEXT](http://img.youtube.com/vi/AlaQc2t8agQ/0.jpg)](https://www.youtube.com/watch?v=AlaQc2t8agQ "Scarborough,Clone of Planet")

不考虑打包签名版的苹果或者Linux版本安装文件，不反对任何人这样做。

使用步骤：
>1. 下载代码
>2. 到 [IPFS官网](https://github.com/ipfs/kubo)下载相应版本的可执行程序，解压缩后只将可执行文件（ipfs-amd64、ipfs.exe或者ipfs）复制到 ipfsbin 文件夹
>3. cd fe && yarn && yarn dev
>4. cd main && yarn && yarn start 

如果要打包：
> 1. cd main && yarn make


想了解开发进展可以follow planet://k51qzi5uqu5dhq1lrl4uz0q7hqxxxvef5ow9x41e3da1owypc873hwbkdzt62c
