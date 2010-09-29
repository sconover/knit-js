#<script type="text/javascript" src="src/Player.js"></script>

require "../schnauzer/lib/schnauzer/safari"
require "fileutils"

def to_script_file_tag(file)
  path = "file://" + File.expand_path(file)
  %{<script type="text/javascript" src="#{path}"></script>\n}
end


source_files = %w{
  lib/arel.js
  lib/core.js
  lib/arel/attributes.js
  lib/arel/attributes/attribute.js
  lib/arel/attributes/integer.js
  lib/arel/attributes/string.js
}

test_files = ["test/test_helper.js"] + Dir["test/**/*_test.js"].to_a.sort


html = File.read("test/browser_suite.html.in")

html.sub!("<!--SOURCE-->", source_files.collect{|sf|to_script_file_tag(sf)}.join)
html.sub!("<!--TEST-->", test_files.collect{|tf|to_script_file_tag(tf)}.join)

File.open("browser_suite.html", "w+"){|f|f<<html}

browser = Schnauzer::SafariBrowser.new
# puts html
browser.load_html(html, :base_url => "file://" + FileUtils.pwd, :wait_after_load => 3)
# browser.js("window.onload()")
puts browser.js("document.body.innerHTML")