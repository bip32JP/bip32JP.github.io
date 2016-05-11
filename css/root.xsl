<?xml-stylesheet type="text/xsl" href="#style1"?>
<xsl:stylesheet id="style1" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html"
 doctype-system="http://www.w3.org/TR/html4/strict.dtd" 
 doctype-public="-//W3C//DTD HTML 4.01//EN" encoding="UTF-8" indent="yes"/>

<xsl:template name="string-replace-all">
    <xsl:param name="text" />
    <xsl:param name="replace" />
    <xsl:param name="by" />
    <xsl:choose>
        <xsl:when test="contains($text, $replace)">
            <xsl:value-of select="substring-before($text,$replace)" />
            <xsl:value-of select="$by" />
            <xsl:call-template name="string-replace-all">
                <xsl:with-param name="text" select="substring-after($text,$replace)" />
                <xsl:with-param name="replace" select="$replace" />
                <xsl:with-param name="by" select="$by" />
            </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$text" />
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>

<xsl:variable name="_lf"><xsl:text>
</xsl:text></xsl:variable>
<xsl:variable name="lf" select="string($_lf)"/>

<xsl:variable name="_cr"><xsl:text></xsl:text></xsl:variable>
<xsl:variable name="cr" select="string($_cr)"/>

<xsl:template name="format-for-html">
    <xsl:param name="text" />
    <xsl:variable name="_newtext-2">
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="$text" />
            <xsl:with-param name="replace" select="'&amp;'" />
            <xsl:with-param name="by" select="'&amp;amp;'" />
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="_newtext-1">
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="$_newtext-2" />
            <xsl:with-param name="replace" select="'&lt;'" />
            <xsl:with-param name="by" select="'&amp;lt;'" />
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="_newtext0">
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="$_newtext-1" />
            <xsl:with-param name="replace" select="'&gt;'" />
            <xsl:with-param name="by" select="'&amp;gt;'" />
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="newtext">
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="$_newtext0" />
            <xsl:with-param name="replace" select="$lf" />
            <xsl:with-param name="by" select="'&lt;b&gt;&lt;font color=&quot;red&quot;&gt;&#x23CE;&lt;/font&gt;&lt;/b&gt;&lt;br/&gt;'" />
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="newtext1">
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="$newtext" />
            <xsl:with-param name="replace" select="$cr" />
            <xsl:with-param name="by" select="''" />
        </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select="$newtext1" />
</xsl:template>

<xsl:template match="root">
  <html>
  <head>
    <title>XML Preview</title>
    <script type="text/javascript">
        function toggleTrans (idval) {
            var id = idval.match(/^\d+/)[0]
            var trans = document.getElementById("trans_" + id)
            var orig = document.getElementById("orig_" + id)
            if (trans.style.display === 'none') {
                trans.style.display = 'inline'
            } else {
                trans.style.display = 'none'
            }
            if (orig.style.display === 'none') {
                orig.style.display = 'inline'
            } else {
                orig.style.display = 'none'
            }
        }
    </script>
  </head>
  <body>
    <table width="100%" border="1" cellpadding="5">
      <xsl:variable name="origset" select="/root/ORIGINAL" />
      <xsl:for-each select="/root/LINE">
          <tr>
            <xsl:variable name="newtext">
                <xsl:call-template name="format-for-html">
                    <xsl:with-param name="text" select="." />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="curpos" select="position()" />
            <xsl:variable name="origtext">
                <xsl:call-template name="format-for-html">
                    <xsl:with-param name="text" select="$origset[$curpos]" />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="newattr">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="./@val" />
                    <xsl:with-param name="replace" select="'|'" />
                    <xsl:with-param name="by" select="'| '" />
                </xsl:call-template>
            </xsl:variable>
            <td width="1%" id="{position()}_code" onclick="toggleTrans(this.id)"><xsl:value-of select="substring-before(./@val,'|')"/></td>
            <td width="1%"><xsl:value-of select="substring-after(substring-after(substring-after(substring-after($newattr,'|'),'|'),'|'),'|')"/></td>
            <td width="100%">
                <div id="trans_{position()}" style="line-height:150%;white-space:pre-wrap;display:inline;">
                    <xsl:value-of select="$newtext" disable-output-escaping="yes"/>
                </div>
                <div id="orig_{position()}" style="line-height:150%;white-space:pre-wrap;display:none;">
                    <xsl:value-of select="$origtext" disable-output-escaping="yes"/>
                </div>
                <xsl:if test="./@gazo">
                    <xsl:variable name="gazonm" select="./@gazo" />
                    <br/>
                    <a href="https://www.jtbgenesis.com/pic/tour/{$gazonm}" target="_blank">
                        <xsl:value-of select="$gazonm"/>
                    </a>
                </xsl:if>
            </td>
          </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
