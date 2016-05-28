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
            
            do
            {
                let jsonData = try NSJSONSerialization.dataWithJSONObject(obj, options: NSJSONWritingOptions.PrettyPrinted)
                let jsonStrg = String(data: jsonData, encoding: NSUTF8StringEncoding)
                try jsonStrg!.writeToFile("pb.json", atomically: true, encoding: NSUTF8StringEncoding)
            }
            catch
            {
                print(error)
            }
        }
    }
    usleep(500000) // sleep for half a second
}