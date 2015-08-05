<?xml-stylesheet type="text/xsl" href="#style1"?>
<xsl:stylesheet id="style1" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="root">
  <html>
  <body>
    <table width="100%" border="1" cellpadding="5">
      <xsl:for-each select="/root/LINE">
          <tr>
            <td><pre><xsl:value-of select="."/></pre></td>
          </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
