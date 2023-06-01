---
layout: post
title:  "Captioned gifs with ffmpeg"
date:   2018-11-20 08:00:00
categories: ffmpeg gif
---

![Making the magic happen]({{ "/images/ffmpeg_example.gif" | absolute_url }})

I had a case where I wanted to make a bug report of some weird UI behavior. Making a recording of this behavior is the best way to show it! But, movie files are large and where would I upload it? Making it a gif would let me attach it easily to an issue but then I would lose the context of any sound.

The best solution would be to make a captioned gif! And we can do it easily with ffmpeg.

## ffmpeg - the hardest working utility in show business

[ffmpeg](https://www.ffmpeg.org/) is an incredible tool for working with video. I've mostly used it to resize video and to convert between formats, but I know that's scratching the surface of what it can do. I have zero background knowledge in the complex world of video formats and ffmpeg is a lifesaver. Plus, it's cross-platform **and** open source!

## Installing  ffmpeg

Since we want to work with captions, we want to make sure we install ffmpeg with support for [`libass`](https://github.com/libass/libass) a library for the Advanced Substation Alpha format of subtitling. On OSX, the full command for the homebrew install that I used was:

{% highlight bash %}
brew install ffmpeg
{% endhighlight %}

## SRT files - how to specify captions

The SRT file format is a very simple way to define subtitles. As described on [https://matroska.org/](https://matroska.org/technical/specs/subtitles/srt.html)

> It consists of four parts, all in text.
1. A number indicating which subtitle it is in the sequence.
2. The time that the subtitle should appear on the screen, and then disappear.
3. The subtitle itself.
4. A blank line indicating the start of a new subtitle.

For the gif at the top of this post, the SRT file consisted of:

{% highlight bash %}
1
00:00:00,000 --> 00:00:08,000
Making the magic happen.
{% endhighlight %}

If we were captioning a vide of someone dancing the hokey pokey it would look like:

{% highlight bash %}
1
00:00:00,000 --> 00:00:05,000
You put your right foot in.

2
00:00:05,000 --> 00:00:10,000
You take your right foot out.

3
00:00:10,000 --> 00:00:15,000
You put your right foot in.

4
00:00:15,000 --> 00:00:20,000
And you shake it all about.
{% endhighlight %}

All your captions are now in a very simple (if verbose) text file format!

## Converting your files

To create the gif at the start of this post I had two different files.

1. `ffmpeg_example.mov` - From a quicktime screen recording
1. `ffmpeg_example.srt` - My caption text file

With ffmpeg installed, that's all you need to make a captioned gif!

{% highlight bash %}
ffmpeg -i ffmpeg_example.mov -vf subtitles=ffmpeg_example.srt -r 10 ffmpeg_example.gif
{% endhighlight %}

Let's break down the arguments.

* `-i ffmpeg_example.mov` - The input to ffmpeg.
* `-vf subtitles=ffmpeg_example.srt` - Run a video filter (vf) over the input, this one being the subtitles filter with the file containing the subtitle information.
* `-r 10` - Set the frame rate to 10 to reduce the overall size.
* `ffmpeg_example.gif` - The resulting output file.

That's it! Go and make all the gifs!

![You make a gif!]({{ "/images/oprah_captioned.gif" | absolute_url }})
