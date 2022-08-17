# Trail Popup Customization in Maps Marker Pro
Here is how you customize the popup text from a trail polyline in Maps Marker Pro

Go to the track in question. Underneath the `<name>` of the track, add a description between `<desc>` tags. From there, a description can be added with HTML. This can be used to add styling and links.

The description syntax looks like this:
```
<![CDATA[
    <strong>Hike Name</strong><br>
    <p>Here is a brief description of the hike in question.</p>
    <a href="https://www.sierrahiking.net/">
        <button>
                Click Here
        </button>
    </a>
]]>
```

The resulting track syntax looks like this:
```
<name>Rae Lakes Loop</name>
<desc>
<![CDATA[
    <strong>Hike Name</strong><br>
    <p>Here is a brief description of the hike in question.</p>
    <a href="https://www.sierrahiking.net/">
        <button>
                Click Here
        </button>
    </a>
]]>
</desc>
<extensions>
    <mmp:color>#99B2DD</mmp:color>
    <mmp:weight>3</mmp:weight>
    <mmp:opacity>1</mmp:opacity>
</extensions>
```