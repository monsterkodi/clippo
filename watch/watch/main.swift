import Cocoa

let pasteboard = NSPasteboard.generalPasteboard()

var changeCount = 0

while (true)
{
    if (changeCount != pasteboard.changeCount)
    {
        changeCount = pasteboard.changeCount
        let items = pasteboard.readObjectsForClasses([NSString.self, NSImage.self], options: nil)
        for item in items!
        {
            var obj = [String: AnyObject]()

            obj["count"] = pasteboard.changeCount

            if let string = item as? String
            {
                obj["text"] = string
            }
            
            if let image = item as? NSImage
            {
                let data = NSBitmapImageRep(data: image.TIFFRepresentation!)!.representationUsingType(.NSPNGFileType, properties: [:])!
                obj["image"] = data.base64EncodedStringWithOptions(NSDataBase64EncodingOptions(rawValue: 0))
            }
            
            let stream = NSOutputStream(toFileAtPath: "pb.json", append: false)!
            stream.open()
            if let error = stream.streamError
            {
                print("stream error: \(error)")
            }
            else
            {
                var err : NSError?
                NSJSONSerialization.writeJSONObject(obj, toStream:stream, options: NSJSONWritingOptions.PrettyPrinted, error: &err)
                if let error = err
                {
                    print("json error: \(error)")
                }
            }
            stream.close()
        }
    }
    usleep(500000) // sleep for half a second
}